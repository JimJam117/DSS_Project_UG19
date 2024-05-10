import Router from 'express';
//import { getIndex, postSearch } from '../controllers/genericController.js';
import { getAllReports, getPage, postReport } from "../controllers/reportController.js"

const router = Router();

router.get('/all', getAllReports);
router.get('/', getPage);
router.post('/', postReport);


export default router;