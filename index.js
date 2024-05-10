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
export const CSRF_TOKEN = "shhhh this is the CSRF code!"

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
// add admin user and default users query
// NOTE: All default user passwords are 'password'
let addDefaultUsers = `
INSERT INTO users (email,username,password,is_admin) 
    VALUES ('admin@movies.com','admin','$2b$10$ARzxy5533qLRDpjKVToWJOtu.ZBZjKb72ADFMIGZImm8vxQWeK7By','true');

INSERT INTO users (email,username,password,is_admin) 
    VALUES ('tom@movies.com','Tom F.','$2b$10$oFDFM8oBs4k1BDnKfPBQ9.sl1f2ufnDzyv4aPEyiT77xiyUD6Wh4i','false');

INSERT INTO users (email,username,password,is_admin) 
    VALUES ('john@movies.com','John H.','$2b$10$A9moKFRhwF9coeGm8RtQpO6bfGuPnvgPf3Di2yUQh0oU0pyN7l/kO','false');
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
import { runSeleniumTests } from './test/Tests.js';

// routes setup
app.use('/', genericRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/movie', movieRoutes);
app.use('/review', reviewRoutes);

app.use('/report', reportRoutes);

// /runSeleniumTests();