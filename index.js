import express from 'express';
import {dirname} from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const current_dir = dirname(fileURLToPath(import.meta.url));

// Env variables
const port = 5000;

// Start server
const app = express();

// All frontend is publicly available for now
app.use(express.static(current_dir + '/frontend'));

// Basic route
app.get('/', (req, res) => {
    res.sendFile(current_dir + '/frontend/index.html');
})

// Other Routes (TODO: set up seperate routes file)
app.get('/movie', (req, res) => {
    res.sendFile(current_dir + '/frontend/movie.html');
})
app.get('/signin', (req, res) => {
    res.sendFile(current_dir + '/frontend/signin.html');
})
app.get('/signup', (req, res) => {
    res.sendFile(current_dir + '/frontend/signup.html');
})
app.get('/reviews', (req, res) => {
    res.sendFile(current_dir + '/frontend/reviews.html');
})

// Listen on port
app.listen(port, () => {console.log(`App started on port ${port}`)});