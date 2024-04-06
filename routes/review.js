import Router from 'express';
import { getAllReviews, getReview, showCreateReviewForm, createReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/', getAllReviews);
router.get('/create', showCreateReviewForm);
router.post('/create', createReview);
router.get('/:id', getReview);




export default router;