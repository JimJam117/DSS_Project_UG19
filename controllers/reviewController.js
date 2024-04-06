import {CreateReview, GetAllReviews, GetReview, GetReviewForMovieByUserId, DeleteReview} from '../models/Review.js'
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
      
        // check if this review belongs to the currently auth'd user
        let reviewBelongsToSessionUser = false

        if (req.session && req.session.authenticated) {
            const session_user = await GetUser(req.session.user.id)

            // check session user is valid
            if (session_user !== undefined) {
                if (user.id === session_user.id) {
                    reviewBelongsToSessionUser = true
                }
            }
        }

        return res.render('review', { 
                session_username: req.session.user ? req.session.user.username : false,
                movie_title: movie.title,
                review_title: review.title,
                review_id: review.id,
                review_body: review.body,
                review_username: user.username,
                review_userid: user.id,
                movie_id: movie.id,
                reviewBelongsToSessionUser: reviewBelongsToSessionUser,
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
                error_code: 401, msg: `Unauthorised: Cannot display page as there is no valid session.`
            }) 
        }

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

// delete a review
export const deleteReview = async (req, res) => {
    try { 
        // Get details from req object. Sanatise all for safety
        const reviewId = sanitiseSQL(req.body.id)

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

        // We also want to check if the provided review id is valid
        const review = await GetReview(reviewId)

        if (review === undefined) {
            return res.status(400).render('oops', {
                session_username: req.session.user ? req.session.user.username : false,
                error_code: 400, msg: `Bad Request: Specified review id does not exist.`
            })   
        }

        // Check if the user is the owner of this review
        const user = await GetUser(req.session.user.id)

        if (review.user_id != user.id) {
            return res.status(401).render('oops', {
                session_username: req.session.user ? req.session.user.username : false,
                error_code: 401, msg: `Unauthorised: You cannot delete reviews from other users.`
            }) 
        }

        // delete review
        await DeleteReview(reviewId)
              
        // display the users page
        return res.redirect('/user/' + user.id)
    
    }
    catch(err) {
        console.log("Error deleting review:", err)
        return res.status(500).render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            error_code: 500, msg: `Error occured when deleting review.`
        })
    } 
}



