import {GetAllReviews, GetReview} from '../models/Review.js'

// get all reviews details
export const getAllReviews = async (req, res) => {
    try { 
        // get all reviews
        const reviews = await GetAllReviews();
            return res.status(200).json(reviews);
    }
    catch(err) {
        return res.status(500).json(err);
    } 
}

// get single review details
export const getReview = async (req, res) => {
    try { 
        const review = await GetReview(req.params.id);
            return res.status(200).json(review);
    }
    catch(err) {
        return res.status(500).json(err);
    } 
}