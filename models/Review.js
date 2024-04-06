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
        return undefined;
    } 
}

export const GetAllReviewsForUserId = async (id) => {
    try { 
        // get all reviews for user
        const client = new pg.Client(dbConfig)
        await client.connect()
        const reviews = await client.query(`SELECT * FROM reviews WHERE user_id='${id}'`)
        return(reviews.rows)
    }
    catch(err) {
        console.log("error getting reviews for user id:")
        console.log(err)
        return undefined;
    } 
}

export const GetAllReviewsForMovieId = async (id) => {
    try { 
        // get all reviews for movie
        const client = new pg.Client(dbConfig)
        await client.connect()
        const reviews = await client.query(`SELECT * FROM reviews WHERE movie_id='${id}'`)
        return(reviews.rows)
    }
    catch(err) {
        console.log("error getting reviews for movie id:")
        console.log(err)
        return undefined;
    } 
}


export const GetReviewForMovieByUserId = async (movie_id, user_id) => {
    try { 
        // get all reviews for movie
        const client = new pg.Client(dbConfig)
        await client.connect()
        const review = await client.query(`SELECT * FROM reviews WHERE movie_id='${movie_id}' AND user_id='${user_id}'`)
        return(review.rows[0])
    }
    catch(err) {
        console.log("error getting review for movie and user id:")
        console.log(err)
        return undefined;
    } 
}

export const GetAllReviewsForQuery = async (query) => {
    try { 
        // get all reviews for query
        const client = new pg.Client(dbConfig)
        await client.connect()
        const reviews = await client.query(`SELECT * FROM reviews WHERE LOWER(title) LIKE '%${query}%' OR LOWER(body) LIKE '%${query}%'`)
        return(reviews.rows)
    }
    catch(err) {
        console.log("error getting reviews for query:")
        console.log(err)
        return undefined;
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
        return undefined;
    } 
}

export const CreateReview = async (rating, title, body, user_id, movie_id) => {
    try { 

        // sql query:
        const query = `INSERT INTO reviews (rating,title,body,user_id,movie_id) VALUES 
        ('${rating}','${title}','${body}','${user_id}','${movie_id}');`

        const client = new pg.Client(dbConfig)
        await client.connect()
        const createReview = await client.query(query)
        console.log("Creating review " + title + " by user " + user_id + ".")
        return(createReview)
    }
    catch(err) {
        console.log("error creating review:")
        console.log(err)
        return undefined;
    } 
}