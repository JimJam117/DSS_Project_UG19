import {GetAllUsers, GetUser} from '../models/User.js'

// get all users details
export const getAllUsers = async (req, res) => {
    try { 
        // get all users
        const users = await GetAllUsers();
            return res.status(200).json(users);
    }
    catch(err) {
        return res.status(500).json(err);
    } 
}

// get single user details
export const getUser = async (req, res) => {
    try { 
        const user = await GetUser(req.params.id);
            return res.status(200).json(user);
    }
    catch(err) {
        return res.status(500).json(err);
    } 
}