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
            return res.status(200).json(movie);
    }
    catch(err) {
        return res.status(500).json(err);
    } 
}