import { dbConfig } from "../config/db_config.js";
import pg from 'pg'

export const GetAllReports = async () => {
    try { 
        // get all reports
        const client = new pg.Client(dbConfig)
        await client.connect()
        const reports = await client.query('SELECT * FROM reports ORDER BY id DESC')
        return(reports.rows)
    }
    catch(err) {
        console.log("error getting reports:")
        console.log(err)
        return undefined;
    } 
}

export const GetReport = async (id) => {
    try { 
        // get report
        const client = new pg.Client(dbConfig)
        await client.connect()
        const reports = await client.query(`SELECT * FROM reports WHERE id='${id}'`)
        console.log("Getting report with id", id)
        return(reports.rows[0])
    }
    catch(err) {
        console.log("error getting report:")
        console.log(err)
        return undefined;
    } 
}

export const CreateReport = async (errorCode, details, browser, timestamp) => {
    try { 

        // sql query:
        const query = `INSERT INTO reports (error_code,details,browser,timestamp) 
            VALUES ('${errorCode}','${details}','${browser}','${timestamp}');`

        const client = new pg.Client(dbConfig)
        await client.connect()
        const report = await client.query(query)
        console.log("Creating report")
        return(report)
    }
    catch(err) {
        console.log("error creating report:")
        console.log(err)
        return undefined;
    } 
}