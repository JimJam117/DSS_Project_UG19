import express from 'express';
import {dirname} from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const current_dir = dirname(fileURLToPath(import.meta.url));

// Env variables
const port = 5000;

// Start server
const app = express();

// resources are static
app.use(express.static(current_dir + '/resources'));

// ejs as view engine
app.set('view engine', 'ejs')

// Basic route
app.get('/', (req, res) => {
    res.render('index')
})

// Other Routes (TODO: set up seperate routes file)
app.get('/movie', (req, res) => {
    res.render('movie')
})
app.get('/signin', (req, res) => {
    res.render('signin')
})
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/reviews', (req, res) => {
    res.render('reviews')
})

// Listen on port
app.listen(port, () => {console.log(`App started on port ${port}`)});