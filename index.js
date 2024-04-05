import express, { query } from 'express';
import {dirname} from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg'
import { dbConfig } from './config/db_config.js';
import {GetAllMovies} from './models/Movie.js'
import {GetAllReviews} from './models/Review.js'
import session from 'express-session'
import bodyParser from 'body-parser'

// Get current directory
const current_dir = dirname(fileURLToPath(import.meta.url));

// Env variables
const PORT = 5000;
const SECRET = "secret code"
const COOKIE = {
    maxAge: 1000000, 
    httpOnly: true,
    secure: false // This should be set to true in production, not for localhost
}

// global store for sessions
export const GLOBAL_STORE = new session.MemoryStore() 

// Start server
const app = express(); 

app.use(session({
    secret: SECRET,
    store: GLOBAL_STORE,
    cookie: COOKIE, // approx 15 mins age for cookie, should be longer in prod
    saveUninitialized: false,
    resave: true
}))

// resources are static
app.use(express.static(current_dir + '/resources'));
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
  }));

// ejs as view engine
app.set('view engine', 'ejs')

// Listen on PORT
app.listen(PORT, () => {console.log(`App started on port ${PORT}`)});


// Database initialisation
const client = new pg.Client(dbConfig); // client used for postgres
await client.connect()
 
let dropTables = `
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS movies;
`

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

// add admin user and default users
let addDefaultUsers = `
INSERT INTO users (email,username,password,is_admin) 
    VALUES ('admin@movies.com','admin','password','true');

INSERT INTO users (email,username,password,is_admin) 
    VALUES ('tom@movies.com','Tom F.','password','false');

INSERT INTO users (email,username,password,is_admin) 
    VALUES ('john@movies.com','John H.','password','false');
`

// add movie records to DB
let addDefaultMovies = `
INSERT INTO movies (title,release_date,director,movie_cast,image_url) 
    values ('Dune','01/01/24','John Smith','cast','poster_1.png');

INSERT INTO movies (title,release_date,director,movie_cast,image_url) 
    VALUES ('The Taste of Things','01/01/24','John Smith','cast','poster_2.png');

INSERT INTO movies (title,release_date,director,movie_cast,image_url) 
    VALUES ('Perfect Days','01/01/24','John Smith','cast','poster_3.png');

INSERT INTO movies (title,release_date,director,movie_cast,image_url) 
    VALUES ('Shayda','01/01/24','John Smith','cast','poster_4.png');
`

// Add default reviews
let addDefaultReviews = `
INSERT INTO reviews (rating,title,body,user_id,movie_id) 
    VALUES ('3','Okay','
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
            Tenetur dolore at velit cum consequatur dolores quam, alias odit 
            pariatur recusandae sunt, laborum illo, veniam nobis amet molestiae 
            voluptatem provident tempore fuga qui a! Dolore nemo sunt, sed eligendi 
            fugiat aspernatur!','2','3');

INSERT INTO reviews (rating,title,body,user_id,movie_id) 
    VALUES ('1','1 Star Bad','
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
            Tenetur dolore at velit cum consequatur dolores quam, alias odit 
            pariatur recusandae sunt, laborum illo, veniam nobis amet molestiae 
            voluptatem provident tempore fuga qui a! Dolore nemo sunt, sed eligendi 
            fugiat aspernatur!','2','2');

INSERT INTO reviews (rating,title,body,user_id,movie_id) 
    VALUES ('5','5 Stars good','
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
        Tenetur dolore at velit cum consequatur dolores quam, alias odit 
        pariatur recusandae sunt, laborum illo, veniam nobis amet molestiae 
        voluptatem provident tempore fuga qui a! Dolore nemo sunt, sed eligendi 
        fugiat aspernatur!','3','1');


`

await client.query(dropTables)

await client.query(usersCreateTable)
await client.query(addDefaultUsers)

await client.query(moviesCreateTable)
await client.query(addDefaultMovies)

await client.query(reviewsCreateTable)
await client.query(addDefaultReviews)


 
await client.end()


import genericRoutes from './routes/generic.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import movieRoutes from './routes/movie.js'
import reviewRoutes from './routes/review.js'


app.use('/', genericRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/movie', movieRoutes);
app.use('/review', reviewRoutes);