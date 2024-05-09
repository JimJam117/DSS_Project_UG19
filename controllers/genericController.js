import { GetAllReviews, GetAllReviewsForQuery } from '../models/Review.js'
import { GetAllMovies, GetAllMoviesForQuery } from '../models/Movie.js'
import { GetAllUsersForQuery } from '../models/User.js'
import sanitiseSQL from '../scripts/sanitiseSQL.js';
import htmlEncode from '../scripts/htmlEncode.js';
import stringFirewallTest from '../scripts/firewall.js';

// get homepage 
export const getIndex = async (req, res) => {
    try {
        // get movies and reviews for display on homepage sections
        const movies = await GetAllMovies();
        const reviews = await GetAllReviews();
        
        const checkedReviews = reviews.filter(review => !stringFirewallTest(review.title) && !stringFirewallTest(review.body));

        // render homepage
        return res.render('index', {
            session_username: req.session.user ? req.session.user.username : false, 
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            movies: movies,
            reviews: checkedReviews
        })
    }
    catch (err) {
        return res.status('500').render('oops', { error_code: 500, msg: "Generic Error" })
    }
}

// search controller
export const postSearch = async (req, res) => {
    try {
        // results array
        let results = []

        if (stringFirewallTest(req.body.query) == false) {
            console.log("firewall passed")
        }
        else {
            console.log("firewall violation!")
            return res.status(500).render('oops', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                error_code: 500, msg: "Generic Error"
            })
        }

        let query = sanitiseSQL(req.body.query)

        // fetch movies, reviews and users that match query (converted to lowercase for better search)
        const movies = await GetAllMoviesForQuery(query.toLowerCase());
        const reviews = await GetAllReviewsForQuery(query.toLowerCase());
        const users = await GetAllUsersForQuery(query.toLowerCase());

        // parse each movie into result object
        for (const movie of movies) {
            results.push({
                name: movie.title,
                url: `/movie/${movie.id}`,
                type: "Movie"
            })
        }

        // parse each user into result object
        for (const user of users) {
            results.push({
                name: user.username,
                url: `/user/${user.id}`,
                type: "User"
            })
        }

        // parse each review into result object
        for (const review of reviews) {
            results.push({
                name: review.title,
                url: `/review/${review.id}`,
                type: "Review"
            })
        }

        //encodes each element of the results the array as strings
        const htmlEncodedResults = results.map(result => ({
            name: htmlEncode(result.name),
            url: htmlEncode(result.url),
            type: htmlEncode(result.type)
        }));

        // return the results and original query
        return res.render('search', {
            session_username: req.session.user ? req.session.user.username : false, 
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            results: htmlEncodedResults,
            query: htmlEncode(query)
        })
    }

    // catch errors
    catch (err) {
        console.log(err)
        return res.status(500).render('oops', {
            session_username: req.session.user ? req.session.user.username : false, 
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            error_code: 500, msg: "Generic Error"
        })
    }
}