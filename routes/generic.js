import Router from 'express';
import { getIndex, postSearch } from '../controllers/genericController.js';

const router = Router();

router.get('/', getIndex);
router.post('/search', postSearch);


export default router;