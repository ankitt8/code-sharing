const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.listen(3000, () => {
    console.log('Server is running on port 3000');
    mongoose.connect('mongodb://localhost:27017/demo-mongoose-mongodb')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('Error connecting to MongoDB', err);
    });
});
