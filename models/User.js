import { dbConfig } from "../config/db_config.js";
import pg from 'pg'
import Cryptr from 'cryptr'
import { ENCRYPTION_KEY } from "../index.js";

export const GetAllUsers = async () => {
    try { 
        // get all users
        const client = new pg.Client(dbConfig)
        await client.connect()
        const users = await client.query('SELECT * FROM users')
        return(users.rows)
    }
    catch(err) {
        console.log("error getting users:")
        console.log(err)
        return undefined;
    } 
}

export const GetUser = async (id) => {
    try { 
        // get user
        const client = new pg.Client(dbConfig)
        await client.connect()
        const users = await client.query(`SELECT * FROM users WHERE id='${id}'`)
        console.log("Getting user with id", id)
        return(users.rows[0])
    }
    catch(err) {
        console.log("error getting user:")
        console.log(err)
        return undefined;
    } 
}


export const GetAllUsersForQuery = async (query) => {
    try { 
        // get all users for query
        const client = new pg.Client(dbConfig)
        await client.connect()
        const users = await client.query(`SELECT * FROM users WHERE LOWER(username) LIKE '%${query}%'`)
        return(users.rows)
    }
    catch(err) {
        console.log("error getting users for query:")
        console.log(err)
        return undefined;
    } 
}


export const GetUserByUsername = async (username) => {
    try { 
        // get user
        const client = new pg.Client(dbConfig)
        await client.connect()
        const users = await client.query(`SELECT * FROM users WHERE LOWER(username)='${username.toLowerCase()}'`)
        console.log("Getting user with username", username)
        return(users.rows[0])
    }
    catch(err) {
        console.log("error getting user:")
        console.log(err)
        return undefined;
    } 
}



export const CheckUserWithEmailExists = async (email) => {
    try { 
        const cryptr = new Cryptr(ENCRYPTION_KEY);

        // get all users
        const client = new pg.Client(dbConfig)
        await client.connect()
        const users = await client.query('SELECT * FROM users')

        for (const user of users.rows) {
            // decrypt the email and check
            if (cryptr.decrypt(user.email) == email) {
                return true
            }
        }
        return(false)
    }
    catch(err) {
        console.log("error getting checking if user with email exists:")
        console.log(err)
        return undefined;
    } 
}


export const CreateUser = async (username, email, password, otp_secret) => {
    try { 
        // sql query:
        const query = `INSERT INTO users (email,username,password,is_admin,otp_secret) 
            VALUES ('${email}','${username}','${password}','false', '${otp_secret}');`

        const client = new pg.Client(dbConfig)
        await client.connect()
        const user = await client.query(query)
        console.log("Creating user " + username)

        return(user)
    }
    catch(err) {
        console.log("error creating user:")
        console.log(err)
        return undefined;
    } 
}