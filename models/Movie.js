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
        return err;
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
        return err;
    } 
}