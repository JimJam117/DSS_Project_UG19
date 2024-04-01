import {GetAllMovies, GetMovie} from '../models/Movie.js'

// get all movies details
export const getAllMovies = async (req, res) => {
    try { 
        // get all movies
        const movies = await GetAllMovies();
            return res.status(200).json(movies);
    }
    catch(err) {
        return res.status(500).json(err);
    } 
}

// get single movie details
export const getMovie = async (req, res) => {
    try { 
        const movie = await GetMovie(req.params.id);
            //return res.status(200).json(movie);
            return res.render('movie', {
                title: movie.title,
                director: movie.director,
                movie_cast: movie.movie_cast,
                release_date: new Date(movie.release_date).toLocaleDateString(),
                image_url: movie.image_url
            })
    }
    catch(err) {
        return res.status('500').render('oops')
    } 
}