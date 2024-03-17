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

// Listen on port
app.listen(port, () => {console.log(`App started on port ${port}`)});