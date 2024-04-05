import { dbConfig } from "../config/db_config.js";
import pg from 'pg'

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
        return err;
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
        return err;
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
        return err;
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
        return err;
    } 
}


export const GetUserByEmail = async (email) => {
    try { 
        // get user
        const client = new pg.Client(dbConfig)
        await client.connect()
        const users = await client.query(`SELECT * FROM users WHERE LOWER(email)='${email.toLowerCase()}'`)
        console.log("Getting user with email", email)
        return(users.rows[0])
    }
    catch(err) {
        console.log("error getting user:")
        console.log(err)
        return err;
    } 
}


export const CreateUser = async (username, email, password) => {
    try { 

        // sql query:
        const query = `INSERT INTO users (email,username,password,is_admin) 
            VALUES ('${email}','${username}','${password}','true');`

        const client = new pg.Client(dbConfig)
        await client.connect()
        const user = await client.query(query)
        console.log("Creating user " + username)
        return(user)
    }
    catch(err) {
        console.log("error creating user:")
        console.log(err)
        return err;
    } 
}