import {GetAllReviews, GetReview, GetAllReviewsForQuery} from '../models/Review.js'
import {GetMovie, GetAllMovies, GetAllMoviesForQuery} from '../models/Movie.js'
import {GetAllUsers, GetUser, GetAllUsersForQuery} from '../models/User.js'

// get homepage 
export const getIndex = async (req, res) => {
    try { 
        // get movies / reviews for display on homepage sections
        const movies = await GetAllMovies();
        const reviews = await GetAllReviews();
        return res.render('index', {
            movies: movies,
            reviews: reviews
        })
    }
    catch(err) {
        return res.status('500').render('oops')
    } 
}


export const postSearch = async (req, res) => {
    try { 
        // results object
        let results = []

        // TODO: This is the search query string, we need to sanatise this input
        let query = req.body.query

        const movies = await GetAllMoviesForQuery(query.toLowerCase());
        const reviews = await GetAllReviewsForQuery(query.toLowerCase());
        const users = await GetAllUsersForQuery(query.toLowerCase());

        for (const movie of movies) {
            results.push({
                name: movie.title,
                url: `/movie/${movie.id}`,
                type: "Movie"
            })
        }

        for (const user of users) {
            results.push({
                name: user.username,
                url: `/user/${user.id}`,
                type: "User"
            })
        }

        for (const review of reviews) {
            results.push({
                name: review.title,
                url: `/review/${review.id}`,
                type: "Review"
            })
        }

        return res.render('search', {
            results,
            query
        })
    }
    catch(err) {
        console.log(err)
        return res.status('500').render('oops')
    } 
}