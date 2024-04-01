import { dbConfig } from "../config/db_config.js";
import pg from 'pg'

export const GetAllReviews = async () => {
    try { 
        // get all reviews
        const client = new pg.Client(dbConfig)
        await client.connect()
        const reviews = await client.query('SELECT * FROM reviews')
        return(reviews.rows)
    }
    catch(err) {
        console.log("error getting reviews:")
        console.log(err)
        return err;
    } 
}

export const GetReview = async (id) => {
    try { 
        // get review
        const client = new pg.Client(dbConfig)
        await client.connect()
        const reviews = await client.query(`SELECT * FROM reviews WHERE id='${id}'`)
        console.log("Getting review with id", id)
        return(reviews.rows[0])
    }
    catch(err) {
        console.log("error getting review:")
        console.log(err)
        return err;
    } 
}