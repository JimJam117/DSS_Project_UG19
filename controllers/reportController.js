import { CreateReport, GetAllReports } from '../models/Report.js';
import sanitiseSQL from '../scripts/sanitiseSQL.js';


// get page route
export const getPage = async (req, res) => {
    try {
        return res.render('report', {
            session_username: req.session.user ? req.session.user.username : false,
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            reportSubmitted: false
        })
    }
    catch (err) {
        req.session.errorCode = 500; 
        res.status(500).render('oops', { error_code: 500, msg: "Generic Error" });
    }
};

// post report route
export const postReport = async (req, res) => {
    try {
        CreateReport(req.session.errorCode, sanitiseSQL(req.body.details), req.headers['user-agent'], new Date().toISOString())

        return res.render('report', {
            session_username: req.session.user ? req.session.user.username : false,
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            reportSubmitted: true
        })
    }
    catch (err) {

    }
};


// get all reports (for admin only) route
export const getAllReports = async (req, res) => {
    try { 
        
        if(req.session.user && req.session.user.isAdmin == true) {
            // get all reports
            const reports = await GetAllReports();

            return res.render('admin-reports', {
                session_username: req.session.user ? req.session.user.username : false,
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                reports: reports
            })
        }
        else {
            console.log(req.session.user)
            req.session.errorCode = 401; 
            return res.status('401').render('oops', {
                session_username: req.session.user ? req.session.user.username : false,
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                error_code: 401, msg: "Could not get reports, you are not the admin!"
            })
        }
    }
    catch(err) {
        req.session.errorCode = 500; 
        return res.status('500').render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            error_code: 500, msg: "Could not get reports"
        })
    } 
}