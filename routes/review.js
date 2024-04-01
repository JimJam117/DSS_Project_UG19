import Router from 'express';
import { getAllReviews, getReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/', getAllReviews);
router.get('/:id', getReview);


export default router;