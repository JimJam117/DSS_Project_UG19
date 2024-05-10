import bcrypt from 'bcrypt'
import sanitiseSQL from '../scripts/sanitiseSQL.js'
import { GetUserByUsername,GetUserByEmail, CreateUser } from '../models/User.js'
import { CSRF_TOKEN, ENCRYPTION_KEY, enum_timeout } from '../index.js'
import stringFirewallTest from '../scripts/firewall.js'
import speakeasy from 'speakeasy'
import { toDataURL } from 'qrcode'
import Cryptr from 'cryptr'

export const showSigninPage = async (req, res) => {

    // if session is already authenticated, then redirect home
    if(req.session.authenticated) {  
        return res.redirect('/');
    }

    // else, render the page
    res.render('signin', {
        session_username: req.session.user ? req.session.user.username : false, 
        csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
        error: false
    })
}

export const showSignupPage = async (req, res) => {

    // if session is already authenticated, then redirect home
    if(req.session.authenticated) {  
        return res.redirect('/');
    }

    // generate a otp secret
    const otp_secret = speakeasy.generateSecret({
        name: 'Movie Blog (DSS UG_19)'
    })

    // generate a qr code for the otp secret
    toDataURL(otp_secret.otpauth_url, (err, data) => {
        // if there is an error generating QR code
        if (err || data === '') {
            req.session.errorCode = 500; 
            return res.status(500).render('oops', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                error_code: 500, msg: "Error Generating QR code."
            })
        }
      

        res.render('signup', {
            session_username: req.session.user ? req.session.user.username : false, 
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            otp_secret_text: otp_secret.ascii,
            qrcode_data_string: data,
            error: false
        })
    })
}

// login a user
export const login = async (req, res) => {
    try { 
        if (stringFirewallTest(req.body.uname) || stringFirewallTest(req.body.password)) {

            req.session.errorCode = 403; 

            return res.status(403).render('oops', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                error_code: 403, msg: `Your login credentials violated our security policies.`
            })   
        }
        // sanatise the inputs
        const username = sanitiseSQL(req.body.uname)
        const password = sanitiseSQL(req.body.password)
        
        // use a generic error message to prevent account enumeration
        const genericErrorMessage = "Username and / or password is incorrect."
   
        // if session is already authenticated, then cannot login!
        if(req.session.authenticated) {  
            await enum_timeout(req.startTime); // account enumeration timeout 
            req.session.errorCode = 400; 
            return res.status(400).render('oops', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                error_code: 400, msg: "Bad Request"
            })
        }

        // check if the username / password is valid
        try {
            // attempt to get the user by the username
            const user = await GetUserByUsername(username)

            // if user could not be found in the DB
            if (user === undefined) {
                await enum_timeout(req.startTime); // account enumeration timeout
                return res.status(401).render('signin', {
                    session_username: false,
                    error: genericErrorMessage
                })
            }
            
            const password_match = await bcrypt.compare(password, user.password);
            
            // if the password hash matches the inputted password
            if (password_match) {
                // decrypt the OTP secret
                const cryptr = new Cryptr(ENCRYPTION_KEY);
                const decrypted_otp_secret = cryptr.decrypt(user.otp_secret);

                // verify the OTP is correct
                const otp_is_verifed = speakeasy.totp.verify({
                    secret: decrypted_otp_secret,
                    encoding: 'ascii',
                    token: req.body.otp_token

                })

                if (!otp_is_verifed) {
                    return res.status(403).render('signin', {
                        session_username: req.session.user ? req.session.user.username : false, 
                        csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                        error: "The 2FA token could not be verifed for the secret. Please try again"
                    })
                }
                        
                // set the session to authenticated
                req.session.authenticated = true;

                req.session.csrfToken = CSRF_TOKEN
                req.session.user = {id: user.id, username: username, isAdmin: user.is_admin}

                // redirect to homepage, now logged in
                await enum_timeout(req.startTime); // account enumeration timeout
                return res.redirect('/')
            } 

            // otherwise the password is incorrect
            else {
                await enum_timeout(req.startTime); // account enumeration timeout
                return res.status(401).render('signin', {
                    session_username: false,
                    error: genericErrorMessage
                })
            }

        } catch (error) {
            await enum_timeout(req.startTime); // account enumeration timeout
            return res.status(500).render('signin', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                error: "Something went wrong!"
            })
        }
    
    }
    catch(err) {
        await enum_timeout(req.startTime); // account enumeration timeout
        req.session.errorCode = 500; 
        return res.status(500).render('oops', {
            session_username: req.session.user ? req.session.user.username : false, 
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            error_code: 500, msg: "Something went wrong."
        })
    } 
}


// logout a user
export const logout = async (req, res) => {

    if (req.body.csrfToken !== CSRF_TOKEN) {
        await enum_timeout(req.startTime); // account enumeration timeout
        return res.status(500).render('oops', {
            session_username: req.session.user ? req.session.user.username : false, 
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            error_code: 500, msg: "Invalid CSRF"
        })
    }

    // destroy the session
    req.session.destroy(async (err) => {
        // if there is an error, render error page
        if (err) {
            await enum_timeout(req.startTime); // account enumeration timeout
            req.session.errorCode = 500; 
            return res.status(500).render('oops', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                error_code: 500, msg: `Something went wrong.`
            })   
        }

        // redirect home once session is closed
        await enum_timeout(req.startTime); // account enumeration timeout
        return res.redirect('/')
    })
}

// Register a new user
export const register = async (req, res) => {
    try { 
        if (stringFirewallTest(req.body.uname) || stringFirewallTest(req.body.email) || stringFirewallTest(req.body.password)) {
            req.session.errorCode = 403; 
            return res.status(403).render('oops', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                error_code: 403, msg: `Your signup credentials violated our security policies, please try again.`
            })   
        }
        // Get details from req object
        const desiredUsername = sanitiseSQL(req.body.uname)
        const email = sanitiseSQL(req.body.email)
        const password = sanitiseSQL(req.body.password)

        // hash password
        const password_salt = await bcrypt.genSalt()
        const password_hash = await bcrypt.hash(password, password_salt)


        // attempt to find the user by username / email...
        const userByUsername = await GetUserByUsername(desiredUsername)
        const userByEmail = await GetUserByEmail(email)

        // as we need to check if the username / email already exist:
        if (userByUsername || userByEmail) {
            await enum_timeout(req.startTime); // account enumeration timeout
            return res.status(403).render('signup', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                otp_secret_text: otp_secret_text,
                qrcode_data_string: qrcode_data_string,
                error: "That username / email already exists! Please log in."
            })
        }

        // verify the OTP is correct
        const otp_is_verifed = speakeasy.totp.verify({
            secret: req.body.otp_secret_text,
            encoding: 'ascii',
            token: req.body.otp_token

        })

        if (!otp_is_verifed) {
            return res.status(403).render('signup', {
                session_username: req.session.user ? req.session.user.username : false, 
                csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
                otp_secret_text: req.body.otp_secret_text,
                qrcode_data_string: req.body.qrcode_data_string ,
                error: "The 2FA token could not be verifed for the secret. Please try again"
            })
        }

        // encrypt OTP secret
        const cryptr = new Cryptr(ENCRYPTION_KEY);
        const otp_secret_encrypted = cryptr.encrypt(req.body.otp_secret_text);
        const email_encrypted = cryptr.encrypt(req.body.email);

        // if username / email is not present, we can create a new user
        await CreateUser(desiredUsername, email_encrypted, password_hash, otp_secret_encrypted)

        // add the credentials to the req object 
        req.body.uname = desiredUsername
        req.body.password = password
        
        // now find the new user and log them in
        const newUser = await GetUserByUsername(desiredUsername)

        // set the session to authenticated
        req.session.authenticated = true;
        req.session.csrfToken = CSRF_TOKEN
        req.session.user = {id: newUser.id, username: desiredUsername, isAdmin: newUser.is_admin}

        // redirect to homepage, now logged in
        await enum_timeout(req.startTime); // account enumeration timeout
        return res.redirect('/')
    
    }
    catch(err) {
        console.log('ERROR DURING REGISTRATION\n' + err)
        await enum_timeout(req.startTime); // account enumeration timeout
        req.session.errorCode = 500; 
        return res.status(500).render('oops', {
            session_username: req.session.user ? req.session.user.username : false, 
            csrf_token: req.session.csrfToken ? req.session.csrfToken : '',
            error_code: 500, msg: "Something went wrong when registering."
        })
    } 
}
