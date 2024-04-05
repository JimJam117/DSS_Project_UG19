import {GetAllReviews, GetReview} from '../models/Review.js'
import {GetMovie} from '../models/Movie.js'
import {GetUser} from '../models/User.js'
import { calcStars } from '../scripts/rating.js';

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