import Router from 'express';
import { getIndex, postSearch } from '../controllers/genericController.js';

const router = Router();

router.get('/', getIndex);
router.post('/search', postSearch);

// Unknown route 404 error
router.get('*', (req, res) => {
    req.session.errorCode = 404; 
    return res.status(404).render('oops', {
        session_username: req.session.user ? req.session.user.username : false, 
        csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
        error_code: 404, msg: `We could not find the page you requested.`
    })   
})

export default router;