import Router from 'express';
import { getAllMovies, getMovie } from '../controllers/movieController.js';

const router = Router();

router.get('/', getAllMovies);
router.get('/:id', getMovie);


export default router;