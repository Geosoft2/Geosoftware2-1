const mongoose = require('mongoose');

const instagram = new mongoose.Schema({
    //a long term access token
    "access-token": String,
    "createdAt": { type: Date, expires: '5184000', default: Date.now } //a long term token will be deleted after 60 days = 5.184.000sec because then it's inactive
    }
);

const instaModel = mongoose.model("InstaModel", instagram);

module.exports = instaModel;