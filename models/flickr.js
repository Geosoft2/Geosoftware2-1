const mongoose = require('mongoose');

const flickr = new mongoose.Schema({
        "photo_id":String,
        "title": String,
        "description": String,
        "user_id":String,
        "group_id":String,
        "user_name":String,
        "url": String,
        "latitude":String ,
        "longitude": String,
        "timestamp": Date,
    }
);

const flickrModel = mongoose.model("FlickrModel", flickr);
module.exports = flickrModel;