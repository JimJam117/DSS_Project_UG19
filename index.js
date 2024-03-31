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
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
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
    "cast" character varying COLLATE pg_catalog."default",
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

// add admin user
let addAdminUser = `
INSERT INTO users (email,username,password,is_admin) 
    SELECT 'admin@movies.com','admin','password','true' WHERE NOT EXISTS (SELECT * FROM users WHERE username='admin')
`





await client.query(dropTables)
await client.query(usersCreateTable)
await client.query(addAdminUser)
await client.query(moviesCreateTable)
await client.query(reviewsCreateTable)
 
await client.end()