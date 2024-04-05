import {GetAllMovies, GetMovie} from '../models/Movie.js'
import { GetAllReviewsForMovieId } from '../models/Review.js';
import { GetUser } from '../models/User.js';
import { calcStars } from '../scripts/rating.js';


// get all movies details
export const getAllMovies = async (req, res) => {
    try { 
        // get all movies
        const movies = await GetAllMovies();
        return res.render('movies', {
            session_username: req.session.user ? req.session.user.username : false,
            movies: movies
        })
    }
    catch(err) {
        return res.status('500').render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            error_code: 500, msg: "Generic Error"
        })
    } 
}

// get single movie details
export const getMovie = async (req, res) => {
    try { 
        // get movie from id
        const movie = await GetMovie(req.params.id);

        // get all reviews for this film
        const reviews = await GetAllReviewsForMovieId(req.params.id);

        // add the user to the review objects in the array
        let reviewsWithUsernames = []
        let reviewsAverage = 0

        for (const review of reviews) {

            // get user for this review
            const user = await GetUser(review.user_id)

            // add review rating to the average
            reviewsAverage += review.rating

            // add username to reviewsWithUsernames
            reviewsWithUsernames.push({...review, review_username: user.username})
        }

        // calculate the average
        reviewsAverage = reviewsAverage / reviews.length

        // generate the rating string
        let ratingString = "No ratings yet."
        if (reviews.length > 0) {
            ratingString = calcStars(reviewsAverage)
        }

        // return a render of the view with the detials as params
        return res.render('movie', {
            session_username: req.session.user ? req.session.user.username : false,
            title: movie.title,
            director: movie.director,
            movie_cast: movie.movie_cast,
            release_date: new Date(movie.release_date).toLocaleDateString(), // convert to date string
            image_url: movie.image_url,
            reviews: reviewsWithUsernames,
            rating: ratingString
        })
    }
    catch(err) {
        return res.status('500').render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            error_code: 500, msg: "Generic Error"
        })
    } 
}