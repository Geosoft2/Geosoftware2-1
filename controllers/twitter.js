// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const Twit = require('twit'); //twit library to access the Twitter API
const Turf = require('@turf/turf'); //turf library for geospatial filtering

//Import config files
const Tokens = require('../config/tokens.js'); //Access Tokens
const Settings = require('../config/server.js'); //Import settings
var moment = require('moment')
//Import Models
const TweetModel = require('../models/tweet.js'); //MongoDB Schema definition to store tweets
const WarningModel = require('../models/warning.js'); //MongoDB Schema definition to store dwd warnings

//Create new twit instance
const TwitClient = new Twit({
    consumer_key: Tokens.twitter_consumer_key,
    consumer_secret: Tokens.twitter_consumer_secret,
    access_token: Tokens.twitter_access_token,
    access_token_secret: Tokens.twitter_access_token_secret
});

/**
 * @desc Requests Tweets directly from Twitter's Search API
 * @param {json} request
 * @param {json} response
 */
exports.requestTweets = (req, res) => {
    TwitClient.get('search/tweets', Settings.twitter_query, (error, data, res) => {
        const raw = data.statuses; //Unfiltered tweets directly received from Twitter API
        try {
            if (raw.length == 0) { //If there are no tweets, do nothing
                console.log("No new tweets available.");
            } else { //Else store tweets
                raw.forEach((tweet) => {
                    if (tweet.place != null) { //Store tweet only if it is geotagged
                        var location = null;
                        if (tweet.place.bounding_box.type == "Polygon") {
                            location = Turf.centroid(tweet.place.bounding_box); //calculate centroid of the polygon
                        } else {
                            location = tweet.place.bounding_box;
                        }

                        //Create new file for MongoDB
                        var file = {
                            id: tweet.id_str, //Tweet ID (String)
                            location: location.geometry, //Location of the tweet (GeoJSON Point)
                            text: tweet.text, //Content of the tweet (String)
                            language: tweet.lang, //Language of the tweet (String)
                            date: tweet.created_at //Date of creation (Date)
                        };

                        TweetModel.replaceOne(
                            { id: file.id },
                            file,
                            { upsert: true }, function (err, photo) {
                                if (err) return handleError(err);
                            });

                    };
                });
            };
        } catch {
            error => console.log(error)
        }
    });
    res.send({}); //TODO: Send appropriate response
};

/**
 * @description function to load tweets from the database. If bbox is given then it will filter for DWD warn layer and also for bbox
 */
exports.loadTweets = async (req, res) => {
    if(req.query.bbox!= undefined){
    var bboxslice = req.query.bbox.slice(1,-1)
    var bboxsplit = bboxslice.split(",")
    var bbox = []
    bboxsplit.forEach (coord =>{ 
        bbox.push(+coord)
        })
    }  
    var warnings = await WarningModel.find({}, { geometry: 1, _id: 0 }).exec();

    var geometries = [];

    await warnings.forEach((w) => {
        geometries.push(w.geometry);
    });

    var tweets = [];

    for (const polygon of geometries) {
        if (bbox!=undefined){
            var result = await getTweetsInsidePolygonBBOX(polygon, bbox);
        }
        else{
            var result = await getTweetsInsidePolygon(polygon);
        }
        result.forEach(elem => {
            tweets.push(elem);
        });
    };

    res.json(tweets);

    function getTweetsInsidePolygon(polygon) {
        return new Promise((resolve) => {
            var query = TweetModel.find({
                location: {
                    $geoWithin: {
                        $geometry: polygon
                    }
                }
            }).limit(1).catch(error => console.log(error));

            resolve(query);
        });
    }

    function getTweetsInsidePolygonBBOX(polygon, bbox) {
        var bb = bbox
        return new Promise((resolve) => {
            var query = TweetModel.find({"$and":[{
                location: {
                    $geoWithin: {
                        $geometry: polygon
                    }
                }
            },{location: {
                    $geoWithin: { $box:  [ [ bb[0], bb[1] ], [ bb[2], bb[3] ] ] }
                }
            }]}).limit(1).exec().catch(error => console.log(error));

            resolve(query);
        });
    }
};


exports.clearUpTweets = async (req, res) => {
    try {
        var older_than = moment().subtract(48, 'hours').toDate();
        await TweetModel.find({ date: { $lt: older_than } }).deleteMany().exec();
    } catch (err) {
        console.error('Data could not be deleted. There has been an ERROR occured', err)
        return err
    }

    res.send({});
}
