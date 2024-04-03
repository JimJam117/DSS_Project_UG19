import {GetAllReviews, GetReview} from '../models/Review.js'
import {GetMovie} from '../models/Movie.js'
import {GetUser} from '../models/User.js'
import { calcStars } from '../rating.js';

// get all reviews details
export const getAllReviews = async (req, res) => {
    try { 
        // get all reviews
        const reviews = await GetAllReviews();
        return res.render('reviews', {
            reviews: reviews,
        })
    }
    catch(err) {
        return res.status('500').render('oops')
    } 
}

// get single review details
export const getReview = async (req, res) => {
    try { 
        const review = await GetReview(req.params.id);

        const movie = await GetMovie(review.movie_id);
        const user = await GetUser(review.user_id);
      
        return res.render('review', {
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
        return res.status('500').render('oops')
    } 
}