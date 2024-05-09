import Router from 'express';
//import { getIndex, postSearch } from '../controllers/genericController.js';
import { getPage, postReport } from "../controllers/reportController.js"

const router = Router();

router.get('/', getPage);
router.post('/', postReport);


export default router;