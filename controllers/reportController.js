

// get page route
export const getPage = async (req, res) => {
    try {
        postReport(req);
        //console.log("sdashs")
        return res.render('report', {
            session_username: req.session.user ? req.session.user.username : false,
        })
    } 
    catch (err) {
        res.status(500).render('oops', { error_code: 500, msg: "Generic Error" });
    }
};

// post report route
export const postReport = async (req, res) => {
    try {

        const reportData = {
            userAgent: req.headers['user-agent'],
            referer: req.headers['referer'],
            origin: req.headers['origin'],
            body: req.body
        };
        console.log(req.headers)

        console.log('CSP Violation Report:', reportData);

        //res.status(200).send('Report received and logged.');
        
    } 
    catch (err) {
       
    }
};