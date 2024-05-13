import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { dbConfig } from './config/db_config.js';
import session from 'express-session';
import bodyParser from 'body-parser';
import { setTimeout } from 'timers/promises';
import fs from 'fs'
import https from 'https'
import path from 'path'

// Our CSRF code
export const CSRF_TOKEN = "shhhh this is the secret CSRF code!"
export const ENCRYPTION_KEY = "shhhh this is the secret encryption code!"

// Get current directory
const current_dir = dirname(fileURLToPath(import.meta.url));

// Env variables
const PORT = 5000;                      // port to run server on
const SECRET = "secret code shhhh";     // secret code for session id gen
const MIN_TIME = 600;                   // Minimum time account-enumeration vunerable operations should take
const COOKIE =                          // Session cookie settings
{
    maxAge: 1000000,                    // ~ 15 mins for demonstration 
    httpOnly: true,                     //  Prevent session hijacking
    secure: true                        //  Changed for HTTPS
}
const GLOBAL_STORE = new session.MemoryStore() // global store for sessions

// Start server
const app = express();

app.use(session({
    secret: SECRET,
    store: GLOBAL_STORE,
    cookie: COOKIE, // approx 15 mins age for cookie, should be longer in production
    saveUninitialized: false,
    resave: true
}))

// Add a start time to all routes, this will be used to keep track of how long the
// request has run for
app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// Async function to delay if the request has taken less time than MIN_TIME
// This is to equalise time and prevent account enumeration
export async function enum_timeout(time) {
    const actualTimeTaken = Date.now() - time
    if (actualTimeTaken < MIN_TIME) {
        await setTimeout(MIN_TIME - (actualTimeTaken))
        console.log(`Req completed in ${actualTimeTaken}ms, delayed to ${Date.now() - time}ms`)
    }
}

// resources are static
app.use(express.static(current_dir + '/resources'));

// JSON and body parsing
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// click-jacking middleware
const setFrameOptions = (req, res, next) => {
    // prevents the page from being embedded in an iframe
    res.setHeader('X-Frame-Options', 'DENY');
    next();
};

app.use(setFrameOptions);

//DDOS protection code:
const requestCounts = {};
const MAX_REQUESTS_PER_IP = 20;
const RESET_TIME = 5000; // 5 seconds 

const DDoSMiddleware = (req, res, next) => {
    const IP = req.ip || req.connection.remoteAddress;
    
    // if an object exists for that IP, carry on, otherwise create a new object for the IP
    requestCounts[IP] = requestCounts[IP] || { count: 0, lastRequest: Date.now() };

    // if time since last request has elapsed and reset the count
    const timeSinceLastRequest = Date.now() - requestCounts[IP].lastRequest;
    if (timeSinceLastRequest > RESET_TIME) {
        requestCounts[IP] = { count: 0, lastRequest: Date.now() };
    }

    // if request count limit is exceeded
    if (requestCounts[IP].count > MAX_REQUESTS_PER_IP) {
        console.log('Rate limit exceeded for IP ', IP);
        return res.status(429).json({ message: 'Too many requests. Please wait and try again.' });
    }

    // update lastRequest time and increment count
    requestCounts[IP].lastRequest = Date.now();
    requestCounts[IP].count++;

    next();
};

app.use(DDoSMiddleware);

// ejs as view engine
app.set('view engine', 'ejs')

// Listen on PORT
//* app.listen(PORT, () => { console.log(`App started on port ${PORT}`) });
const options = {
    cert: fs.readFileSync('certificate/localhost.pem'),
    key: fs.readFileSync('certificate/localhost-key.pem')
};

// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
});

/// ---------- DATABASE --------------
// Database initialisation
const client = new pg.Client(dbConfig); // client used for postgres
await client.connect()

// drop tables query, used to reset db
let dropTables = `
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS reports;
`

// create users table query
let usersCreateTable = `
CREATE TABLE IF NOT EXISTS users 
( 
    id serial NOT NULL,
    email character varying COLLATE pg_catalog."default" NOT NULL,
    username character varying COLLATE pg_catalog."default" NOT NULL,
    otp_secret character varying COLLATE pg_catalog."default",
    password character varying COLLATE pg_catalog."default",
    is_admin boolean NOT NULL DEFAULT false,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_unique UNIQUE (id),
    CONSTRAINT users_username_unique UNIQUE (username)
);
`
// create movies table query
let moviesCreateTable = `
CREATE TABLE IF NOT EXISTS movies
(
    id serial NOT NULL,
    title character varying COLLATE pg_catalog."default" NOT NULL,
    release_date date,
    director character varying COLLATE pg_catalog."default",
    movie_cast character varying COLLATE pg_catalog."default",
    image_url character varying COLLATE pg_catalog."default",
    CONSTRAINT movies_pkey PRIMARY KEY (id),
    CONSTRAINT movies_pkey_unique UNIQUE (id)
);
`
// create reviews table query
let reviewsCreateTable = `
CREATE TABLE IF NOT EXISTS reviews
(
    id serial NOT NULL,
    rating integer NOT NULL,
    title character varying COLLATE pg_catalog."default",
    body character varying COLLATE pg_catalog."default",
    user_id integer NOT NULL,
    movie_id integer NOT NULL,
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT review_movie_fkey FOREIGN KEY (movie_id)
        REFERENCES public.movies (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT review_user_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
`
// add admin user and default users query. Email and OTP are encrypted, password is hashed
// NOTE: All default user passwords are 'password'
// NOTE: 2FA information for these test users can be found in default_users_encryption.html in the root directory
let addDefaultUsers = `
INSERT INTO users (email,username,password,is_admin,otp_secret) 
    VALUES (
    '7410fb9dfc2a641a78772129e0de5b09de1ea9c78c7b5bdde85fb17f8f7f7e50000e9dd6e03fb500786a3e6f192c759c4545e4a1cf29ff2e551859de3c24c4d869fc8fe4123c7c1f6e44c31ec6054130797f9f328a87d684e3e5cd6d8f4efb779ff9e2fde4815ab4050555dcc7fbcea9',
    'admin',
    '$2b$10$ARzxy5533qLRDpjKVToWJOtu.ZBZjKb72ADFMIGZImm8vxQWeK7By',
    'true',
    '33fabc2a46e464f60c34d462934ce61746b25b5fd9fe753ddfce46b504a17eff27298f4b8895f246a98210e9e9845c2f97856d54c8fe6ba4c14e74fcb1b65cff9515dd6d4d2e687cac53dece11ab0cc3ddd7211607d017c0735c037eb1b42e3ab3a325ab246412285320c02621180de16395d20ede7127f0244d444e06c05213'
    );

INSERT INTO users (email,username,password,is_admin,otp_secret) 
    VALUES (
    'a36fe67010aeb276b28548b3d05f705f489cf4516bed64a38d6127e150539f391d04a9da7a2a5824cedc2622314e08288a7265ff92cc8ebef1b8491d3b6ec700da81938dfdedca954ff806db2d0ef193ac99fa7456a2e5ab60bbd7736ec2689ed5a53e51a099cc8989634d822e3e',
    'Tom F.',
    '$2b$10$oFDFM8oBs4k1BDnKfPBQ9.sl1f2ufnDzyv4aPEyiT77xiyUD6Wh4i',
    'false',
    '65e6d1993d6ae05b387ccc2cb27b7ef39b5ba9fe02b772a977325ce128ab36b1b619b90be8bfbad89930212847b6eab4535099f3e7867db28c6a56aaaaacc2568f82f8fafb03f198159f68ff2dbd0f845864b8b819cfab5f23fec69af072cd3d8e2c56d9b073cb7ff32927d9aa752da2c4deb4d2489cdba2dd2064706fdbde72'
    );

INSERT INTO users (email,username,password,is_admin,otp_secret) 
    VALUES (
    '5920f85e927cfb741ac1856d7c675b953dcbcaee3ef383ae84fe079efe984566263717d933a085152910cc47a780b79c80abd696547b8d0a8ea48b898e76173315ffc5cecb53c6a485503fd5c5a5b2cdd1da1cad137ddd2f48d1729fd56ccd9f2e8551f55778d2262d3f1dd2ae952d',
    'John H.',
    '$2b$10$A9moKFRhwF9coeGm8RtQpO6bfGuPnvgPf3Di2yUQh0oU0pyN7l/kO',
    'false',
    '516d3f2638a6eaf88fc3315e21eb0e5afe9d878e2a9d2724dc17c87bbb755b201d5cc364ce415e17e1728b24694d0a22f7f8363d317d1c4bd37b966d73458010ac765a8112f2d91a3674193fa98bf47c7e7c492e9993e6dbc4bf2161a1c4df68e3e3c56791d7f8db5503b16b8b59eecb094e6a6deebf080f6230c93730633a59'
    );
`

// add movie records to DB query
let addDefaultMovies = `
INSERT INTO movies (title,release_date,director,movie_cast,image_url) 
    values ('Dune','04/04/24','Denis Villeneuve','Timothee Chalamet, Rebecca Ferguson, Oscar Isaac, Josh Brolin','poster_1.png');

INSERT INTO movies (title,release_date,director,movie_cast,image_url) 
    VALUES ('The Taste of Things','01/01/24','Tran Anh Hung','Juliette Binoche, Benoit Magimel, Dodin Bouffant','poster_2.png');

INSERT INTO movies (title,release_date,director,movie_cast,image_url) 
    VALUES ('Perfect Days','03/03/24','Wim Wenders','Koji Yakusho, Tokio Emoto','poster_3.png');

INSERT INTO movies (title,release_date,director,movie_cast,image_url) 
    VALUES ('Shayda','02/02/24','Noora Niasari',' Leah Purcell Zar Amir Ebrahimi','poster_4.png');
`

// Add default reviews query
let addDefaultReviews = `
INSERT INTO reviews (rating,title,body,user_id,movie_id) 
    VALUES ('3','Perfect Days was okay','
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
            Tenetur dolore at velit cum consequatur dolores quam, alias odit 
            pariatur recusandae sunt, laborum illo, veniam nobis amet molestiae 
            voluptatem provident tempore fuga qui a! Dolore nemo sunt, sed eligendi 
            fugiat aspernatur!','2','3');

INSERT INTO reviews (rating,title,body,user_id,movie_id) 
    VALUES ('1','I disliked like The Taste of Things','
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
            Tenetur dolore at velit cum consequatur dolores quam, alias odit 
            pariatur recusandae sunt, laborum illo, veniam nobis amet molestiae 
            voluptatem provident tempore fuga qui a! Dolore nemo sunt, sed eligendi 
            fugiat aspernatur!','2','2');

INSERT INTO reviews (rating,title,body,user_id,movie_id) 
    VALUES ('5','I liked Dune','
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
        Tenetur dolore at velit cum consequatur dolores quam, alias odit 
        pariatur recusandae sunt, laborum illo, veniam nobis amet molestiae 
        voluptatem provident tempore fuga qui a! Dolore nemo sunt, sed eligendi 
        fugiat aspernatur!','3','1');
`


// create reports table query
let reportsCreateTable = `
CREATE TABLE IF NOT EXISTS reports
(
    id serial NOT NULL,
    error_code integer NOT NULL,
    details character varying COLLATE pg_catalog."default",
    browser character varying COLLATE pg_catalog."default",
    timestamp character varying COLLATE pg_catalog."default"
)
`


// Run queries to init database
await client.query(dropTables)

await client.query(usersCreateTable)
await client.query(addDefaultUsers)

await client.query(moviesCreateTable)
await client.query(addDefaultMovies)

await client.query(reviewsCreateTable)
await client.query(addDefaultReviews)

await client.query(reportsCreateTable)

await client.end()


/// ---------- ROUTES --------------
// routes import
import genericRoutes from './routes/generic.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import movieRoutes from './routes/movie.js'
import reviewRoutes from './routes/review.js'

import reportRoutes from './routes/report.js'
import { Interface } from 'readline';

// routes setup
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/movie', movieRoutes);
app.use('/review', reviewRoutes);
app.use('/report', reportRoutes);
app.use('/', genericRoutes);
