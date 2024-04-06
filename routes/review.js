import Router from 'express';
import { getAllReviews, getReview, showCreateReviewForm, createReview, deleteReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/', getAllReviews);
router.get('/create', showCreateReviewForm);
router.post('/create', createReview);
router.post('/delete', deleteReview);
router.get('/:id', getReview);




export default router;