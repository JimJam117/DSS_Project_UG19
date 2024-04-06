import { dbConfig } from "../config/db_config.js";
import pg from 'pg'

export const GetAllMovies = async () => {
    try { 
        // get all movies
        const client = new pg.Client(dbConfig)
        await client.connect()
        const movies = await client.query('SELECT * FROM movies')
        return(movies.rows)
    }
    catch(err) {
        console.log("error getting movies:")
        console.log(err)
        return undefined;
    } 
}

export const GetMovie = async (id) => {
    try { 
        // get movie
        const client = new pg.Client(dbConfig)
        await client.connect()
        const movies = await client.query(`SELECT * FROM movies WHERE id='${id}'`)
        console.log("Getting movie with id", id)
        return(movies.rows[0])
    }
    catch(err) {
        console.log("error getting movie:")
        console.log(err)
        return undefined;
    } 
}

export const GetAllMoviesForQuery = async (query) => {
    try { 
        // get all movies for query
        const client = new pg.Client(dbConfig)
        await client.connect()
        const movies = await client.query(`SELECT * FROM movies WHERE LOWER(title) LIKE '%${query}%' OR LOWER(director) LIKE '%${query}%' OR LOWER(movie_cast) LIKE '%${query}%'`)
        console.log("mv:",movies)
        return(movies.rows)
    }
    catch(err) {
        console.log("error getting movies for query:")
        console.log(err)
        return undefined;
    } 
}
