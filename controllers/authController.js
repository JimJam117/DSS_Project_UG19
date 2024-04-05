import bcrypt from 'bcrypt'
import sanitiseSQL from '../scripts/sanitiseSQL.js'
import { GLOBAL_STORE } from '../index.js'
import { GetUserByUsername } from '../models/User.js'

// login a user
export const login = async (req, res) => {
    try { 
        const username = req.body.uname
        const password = req.body.password
        
        // use a generic error message to prevent account enumeration
        const genericErrorMessage = "Username and / or password is incorrect."
   
        // if the cookie claims to be authenticated
        if(req.session.authenticated) {
            
            // check it actually is in the store
            if (req.sessionID in GLOBAL_STORE.sessions) {
                return res.json(["User is already logged in with session id " + req.sessionID, req.session])
            }
            else {
                return res.status(400).render('oops', {
                    session_username: req.session.user ? req.session.user.username : false,
                    error_code: 400, msg: "Bad Request"
                })
            }
        }
        // If the cookie has not been authenticated
        else {

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
                    // set the session to authenticated, 
                    req.session.authenticated = true;
                    req.session.user = {username}

                    return res.redirect('/')
                } 
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
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).render('oops', {
                session_username: req.session.user ? req.session.user.username : false,
                error_code: 500, msg: "Something went wrong."
            })   
        }
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
        

        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(password, salt)

        return res.json({
            desiredUsername, email, password, salt, hash
        })
    }
    catch(err) {
        return res.status(500).json(err);
    } 
}
