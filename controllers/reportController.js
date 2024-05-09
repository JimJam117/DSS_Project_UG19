import sanitiseSQL from '../scripts/sanitiseSQL.js';


// get page route
export const getPage = async (req, res) => {
    try {
        //postReport(req);
        return res.render('report', {
            session_username: req.session.user ? req.session.user.username : false,
            reportSubmitted: false
        })
    }
    catch (err) {
        res.status(500).render('oops', { error_code: 500, msg: "Generic Error" });
    }
};

// post report route
export const postReport = async (req, res) => {
    try {
        const reportData = [
            ["errorCode", req.session.errorCode],
            ["details", sanitiseSQL(req.body.details)],
            ["browser", req.headers['sec-ch-ua']],
            ["timestamp", new Date().toISOString()]
        ];
        console.log("reportData: ", reportData)

        return res.render('report', {
            session_username: req.session.user ? req.session.user.username : false,
            reportSubmitted: true
        })

    }
    catch (err) {

    }
};