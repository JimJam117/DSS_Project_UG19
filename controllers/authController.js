import bcrypt from 'bcrypt'
import sanitiseSQL from '../scripts/sanitiseSQL.js'
import { GLOBAL_STORE } from '../index.js'
import { GetUserByUsername,GetUserByEmail, CreateUser } from '../models/User.js'


// login a user
export const login = async (req, res) => {

    try { 
        // sanatise the inputs
        const username = sanitiseSQL(req.body.uname)
        const password = sanitiseSQL(req.body.password)
        
        // use a generic error message to prevent account enumeration
        const genericErrorMessage = "Username and / or password is incorrect."
   
        // if the cookie claims to be already authenticated, then cannot login!
        if(req.session.authenticated) {   
            return res.status(400).render('oops', {
                session_username: req.session.user ? req.session.user.username : false,
                error_code: 400, msg: "Bad Request"
            })
        }

        // check if the username / password is valid
        try {

            // attempt to get the user by the username
            const user = await GetUserByUsername(username)

            // if user could not be found in the DB
            if (user === undefined) {
                return res.status(401).render('signin', {
                    session_username: false,
                    error: genericErrorMessage
                })
            }
            
            // if the password matches the inputted password
            else if (user.password === password) {
                
                // set the session to authenticated
                req.session.authenticated = true;
                req.session.user = {id: user.id, username: username}

                // redirect to homepage, now logged in
                return res.redirect('/')
            } 

            // otherwise the password is incorrect
            else {
                return res.status(401).render('signin', {
                    session_username: false,
                    error: genericErrorMessage
                })
            }

        } catch (error) {
            return res.status(500).render('signin', {
                session_username: req.session.user ? req.session.user.username : false,
                error: "Something went wrong!"
            })
        }
    
    }
    catch(err) {
        return res.status(500).render('oops', {
            session_username: req.session.user ? req.session.user.username : false,
            error_code: 500, msg: "Something went wrong."
        })
    } 
}


// logout a user
export const logout = async (req, res) => {

    // destroy the session
    req.session.destroy((err) => {
        // if there is an error, render error page
        if (err) {
            return res.status(500).render('oops', {
                session_username: req.session.user ? req.session.user.username : false,
                error_code: 500, msg: `Something went wrong.`
            })   
        }

        // redirect home once session is closed
        return res.redirect('/')
    })
}

// Register a new user
export const register = async (req, res) => {
    try { 

        // Get details from req object
        const desiredUsername = sanitiseSQL(req.body.uname)
        const email = sanitiseSQL(req.body.email)
        const password = sanitiseSQL(req.body.password)

        // attempt to find the user by username / email...
        const userByUsername = await GetUserByUsername(desiredUsername)
        const userByEmail = await GetUserByEmail(email)

        // as we need to check if the username / email already exist:
        if (userByUsername || userByEmail) {
            return res.status(403).render('signup', {
                session_username: req.session.user ? req.session.user.username : false,
                error: "That username / email already exists! Please log in."
            })
        }

        // if username / email is not present, we can create a new user
        const newUser = await CreateUser(desiredUsername, email, password)

        // add the credentials to the req object 
        req.body.uname = desiredUsername
        req.body.password = password
        
        // log the user in
        return await login(req, res)
    

        // const salt = await bcrypt.genSalt()
        // const hash = await bcrypt.hash(password, salt)

    }
    catch(err) {
        return res.status(500).json(err);
    } 
}
