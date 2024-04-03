import {GetAllReviewsForUserId, GetReview} from '../models/Review.js'
import {GetMovie} from '../models/Movie.js'
import {GetAllUsers, GetUser} from '../models/User.js'
import { getMovie } from './movieController.js';

// get all users details
export const getAllUsers = async (req, res) => {
    try { 
        // get all users
        const users = await GetAllUsers();
        return res.render('users', {
            users: users
        })
    }
    catch(err) {
        return res.status(500).json(err);
    } 
}

// get single user details
export const getUser = async (req, res) => {
    try { 
        // get the user details
        const user = await GetUser(req.params.id);

        // get all reviews by this user
        const reviews = await GetAllReviewsForUserId(req.params.id);
        
        // add the movie title to the review objects in the array
        let reviewsWithMovieTitles = []
        for (const review of reviews) {
            
            const movie = await GetMovie(review.movie_id)
            reviewsWithMovieTitles.push({...review, movie_title: movie.title})
        }
        
        return res.render('user', {
                user_reviews: reviewsWithMovieTitles,
                user_username: user.username,
            })
    }
    catch(err) {
        console.log(err)
        return res.status('500').render('oops')
    } 
}