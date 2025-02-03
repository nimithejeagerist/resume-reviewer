const express = require('express');
const cors = require('cors');
require('dotenv').config();
const uploadRouter = require('./src/api/upload');
const matchRouter = require('./src/api/match');


const app = express();

app.use(cors());
app.use(express.json());

console.log('Loading upload router...');
app.use('/api', uploadRouter);
console.log('Upload router loaded!');

console.log('Loading match router...');
app.use('/api', matchRouter);
console.log('Match router loaded!');

app.get('/', (req, res) => {
    res.send('Hello World');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});