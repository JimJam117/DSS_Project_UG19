import express, { query } from 'express';
import {dirname} from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg'


// Get current directory
const current_dir = dirname(fileURLToPath(import.meta.url));

// Env variables
const port = 5000;

const client = new pg.Client({
    host: 'localhost',
    user: 'postgres',
    password: 'password',
    port: 5432,
   database: 'DSS'
})

// Start server
const app = express();

// resources are static
app.use(express.static(current_dir + '/resources'));

// ejs as view engine
app.set('view engine', 'ejs')

// Basic route
app.get('/', (req, res) => {
    res.render('index')
})

// Other Routes (TODO: set up seperate routes file)
app.get('/movie', (req, res) => {
    res.render('movie')
})
app.get('/signin', (req, res) => {
    res.render('signin')
})
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/reviews', (req, res) => {
    res.render('reviews')
})




// Listen on port
app.listen(port, () => {console.log(`App started on port ${port}`)});



await client.connect()
 
let dropTables = `
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS movies;
`

let usersCreateTable = `
CREATE TABLE IF NOT EXISTS users 
( 
    id integer NOT NULL,
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
    id integer NOT NULL,
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
    id integer NOT NULL,
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
INSERT INTO users (id,email,username,password,is_admin) 
    SELECT '1','admin@movies.com','admin','password','true' WHERE NOT EXISTS (SELECT * FROM users WHERE username='admin');

INSERT INTO users (id,email,username,password,is_admin) 
    SELECT '2','tom@movies.com','Tom F.','password','false' WHERE NOT EXISTS (SELECT * FROM users WHERE username='Tom F.');

INSERT INTO users (id,email,username,password,is_admin) 
    SELECT '3','john@movies.com','John H.','password','false' WHERE NOT EXISTS (SELECT * FROM users WHERE username='John H.');
`

// add movie records to DB
let addDefaultMovies = `
INSERT INTO movies (id,title,release_date,director,movie_cast,image_url) 
    SELECT '1','Dune','01/01/24','John Smith','cast','poster_1.png' WHERE NOT EXISTS (SELECT * FROM movies WHERE title='Dune');

INSERT INTO movies (id,title,release_date,director,movie_cast,image_url) 
    SELECT '2','The Taste of Things','01/01/24','John Smith','cast','poster_2.png' WHERE NOT EXISTS (SELECT * FROM movies WHERE title='The Taste of Things');

INSERT INTO movies (id,title,release_date,director,movie_cast,image_url) 
    SELECT '3','Perfect Days','01/01/24','John Smith','cast','poster_3.png' WHERE NOT EXISTS (SELECT * FROM movies WHERE title='Perfect Days');

INSERT INTO movies (id,title,release_date,director,movie_cast,image_url) 
    SELECT '4','Shayda','01/01/24','John Smith','cast','poster_4.png' WHERE NOT EXISTS (SELECT * FROM movies WHERE title='Shayda');
`

// Add default reviews
let addDefaultReviews = `
INSERT INTO reviews (id,rating,title,body,user_id,movie_id) 
    SELECT '1','3','Okay','Lorem Ipsum','2','3' WHERE NOT EXISTS (SELECT * FROM reviews WHERE id='1');

INSERT INTO reviews (id,rating,title,body,user_id,movie_id) 
    SELECT '2','1','1 Star Bad','Lorem Ipsum','2','2' WHERE NOT EXISTS (SELECT * FROM reviews WHERE id='2');

INSERT INTO reviews (id,rating,title,body,user_id,movie_id) 
    SELECT '3','5','5 Stars good','Lorem Ipsum','3','1' WHERE NOT EXISTS (SELECT * FROM reviews WHERE id='3');


`

await client.query(dropTables)

await client.query(usersCreateTable)
await client.query(addDefaultUsers)

await client.query(moviesCreateTable)
await client.query(addDefaultMovies)

await client.query(reviewsCreateTable)
await client.query(addDefaultReviews)


 
await client.end()