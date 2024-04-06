import {CreateReview, GetAllReviews, GetReview, GetReviewForMovieByUserId} from '../models/Review.js'
import {GetAllMovies, GetMovie} from '../models/Movie.js'
import {GetUser} from '../models/User.js'
import { calcStars } from '../scripts/rating.js';
import sanitiseSQL from '../scripts/sanitiseSQL.js';

// get all reviews details
export const getAllReviews = async (req, res) => {
    try { 
        // get all reviews
        const reviews = await GetAllReviews();
        return res.render('reviews', {
            session_username: req.session.user ? req.session.user.username : false,
            reviews: reviews,
        })
    }
    catch(err) {
        return res.status('500').render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            error_code: 500, msg: "Generic Error"
        })
    } 
}

// get single review details
export const getReview = async (req, res) => {
    try { 
        const review = await GetReview(req.params.id);

        const movie = await GetMovie(review.movie_id);
        const user = await GetUser(review.user_id);
      
        return res.render('review', { 
                session_username: req.session.user ? req.session.user.username : false,
                movie_title: movie.title,
                review_title: review.title,
                review_body: review.body,
                review_username: user.username,
                review_userid: user.id,
                movie_id: movie.id,
                rating: calcStars(review.rating)
            })
    }
    catch(err) {
        console.log(err)
        return res.status('500').render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            error_code: 500, msg: "Generic Error"
        })
    } 
}

// show create review form
export const showCreateReviewForm = async (req, res) => {
    try { 
        // get all movies
        const movies = await GetAllMovies();
        return res.render('createReview', {
            session_username: req.session.user ? req.session.user.username : false,
            movies: movies,
            selectedMovieId: req.body.movieId ? req.body.movieId : false,
            error: false
        })
    }
    catch(err) {
        return res.status('500').render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            error_code: 500, msg: "Generic Error"
        })
    } 
}

// Register a new review
export const createReview = async (req, res) => {
    try { 

        // Get details from req object. Sanatise all for safety
        const title = sanitiseSQL(req.body.title)
        const body = sanitiseSQL(req.body.body)
        const rating = sanitiseSQL(req.body.rating)
        const movie_id = sanitiseSQL(req.body.movie_id)

        const movies = await GetAllMovies()

        // first, check there is a session and the user id is valid
        if (req.session && req.session.authenticated) {

            const user = await GetUser(req.session.user.id)

            // check user id is valid
            if (user === undefined) {
                return res.status(400).render('oops', {
                    session_username: req.session.user ? req.session.user.username : false,
                    error_code: 400, msg: `Bad Request: Current user session is not valid.`
                })   
            }
        }

        // if the user is not authenticated
        else {
            return res.status(401).render('oops', {
                session_username: req.session.user ? req.session.user.username : false,
                error_code: 401, msg: `Unauthorised: No valid session.`
            }) 
        }


        // We also want to check if the provided movie id is valid
        const user = await GetUser(req.session.user.id)
        const movie = await GetMovie(movie_id)

        if (movie === undefined) {
            return res.status(400).render('createReview', {
                session_username: req.session.user ? req.session.user.username : false,
                movies,
                error: `Bad Request: Specified movie id does not exist.`
            })   
        }

        // Check if the user has already made a review for this movie...
        const preexistingReview = await GetReviewForMovieByUserId(movie_id, user.id)
        console.log("preexisting review:", preexistingReview)
        if (preexistingReview !== undefined) {
            return res.status(403).render('createReview', {
                session_username: req.session.user ? req.session.user.username : false,
                movies,
                error: `Your account ${user.username} has already made a review for this movie ${movie.title}.`
            })
        }

        // check that the title and body meet the minimum length
        if (title.length < 1) {
            return res.status(403).render('createReview', {
                session_username: req.session.user ? req.session.user.username : false,
                movies,
                error: `The title is empty.`
            })
        }

        console.log("body:", body)
        if (body === undefined || body.length < 1) {
            return res.status(403).render('createReview', {
                session_username: req.session.user ? req.session.user.username : false,
                movies,
                error: `The body is empty.`
            })
        }

        // create new review
        await CreateReview(rating, title, body, user.id, movie_id)
        
        // get the details of the review
        const newReview = await GetReviewForMovieByUserId(movie_id, user.id)
        
        // display the new review
        return res.redirect('/review/' + newReview.id)
    

    }
    catch(err) {
        console.log("Error creating review:", err)
        return res.status(500).render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            error_code: 500, msg: `Error occured when creating review.`
        })
    } 
}



