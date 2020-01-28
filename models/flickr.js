const mongoose = require('mongoose');
const GeoJSON = require('mongoose-geojson-schema');

const flickr = new mongoose.Schema({
        "photo_id":String,
        "secret": String,
        "server": String,
        "farm": String,
        "title": String,
        "description": String,
        "user_id":String,
        "group_id":String,
        "user_name":String,
        "url": String,
        "location": mongoose.Schema.Types.Mixed,
        "latitude":String ,
        "longitude": String,
        "timestamp": Date,
    }
);

const flickrModel = mongoose.model("FlickrModel", flickr);
module.exports = flickrModel;