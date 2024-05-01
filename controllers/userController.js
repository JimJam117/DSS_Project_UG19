import {GetAllReviewsForUserId, GetReview} from '../models/Review.js'
import {GetMovie} from '../models/Movie.js'
import {GetAllUsers, GetUser} from '../models/User.js'
import { getMovie } from './movieController.js';
import stringFirewallTest from '../scripts/firewall.js';

// get all users details
export const getAllUsers = async (req, res) => {
    try { 
        // get all users
        const users = await GetAllUsers();
        const checkedUsers = users.map(user => {
            if (!stringFirewallTest(user)) {
                return user
            }  
        });

        return res.render('users', {
            session_username: req.session.user ? req.session.user.username : false,
            users: checkedUsers
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

        //check the username through the firewall 
        const violation = stringFirewallTest(user.username);

        if (violation) {
            // If user data is not secure, render an error page
            return res.status(403).render('oops', {
                session_username: req.session.user ? req.session.user.username : false,
                error_code: 403, msg: `This username violated our security policies`
            })  
        }

        // get all reviews by this user
        const reviews = await GetAllReviewsForUserId(req.params.id);
        
        // add the movie title to the review objects in the array
        let reviewsWithMovieTitles = []
        for (const review of reviews) {
            
            const movie = await GetMovie(review.movie_id)
            reviewsWithMovieTitles.push({...review, movie_title: movie.title})

        }
        
        return res.render('user', {
                session_username: req.session.user ? req.session.user.username : false,
                user_reviews: reviewsWithMovieTitles,
                user_username: user.username,
            })
    }
    catch(err) {
        console.log(err)
        return res.status('500').render('')
    } 
}
