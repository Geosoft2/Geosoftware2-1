// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const Twit = require('twit'); //twit library to access the Twitter API
const WFS = require('wfs');
const Turf = require('@turf/turf');

//Import config files
const Tokens = require('../config/tokens.js'); //Access Tokens
const Settings = require('../config/settings');

//Import Models
const TweetModel = require('../models/tweet.js'); //MongoDB Schema definition to save tweets
const WarningModel = require('../models/warning.js');

//Define Variables
//Create new twit instance
const TwitClient = new Twit({
  consumer_key: Tokens.twitter_consumer_key,
  consumer_secret: Tokens.twitter_consumer_secret,
  access_token: Tokens.twitter_access_token,
  access_token_secret: Tokens.twitter_access_token_secret
});

/**
* @desc
* @param {object} req request, containing information about the HTTP request
* @param {object} res response, to send back the desired HTTP response
*/
exports.getApi = (req, res) => {

};

exports.getV1 = (req, res) => {

};

/**
 * @desc Requests Tweets directly from Twitter's Search API
 * @param {json} request
 * @param {json} response
 */
exports.postV1TwitterInit = (req, res) => {
  TwitClient.get('search/tweets', Settings.twitter_query, (error, data, res) => {
    const raw = data.statuses; //Unfiltered tweets directly received from Twitter API

    if (raw.length == 0) { //If there are no tweets, do nothing
      console.log("No new tweets available.");
    } else { //Else filter the tweets
      //Filter tweets by storing only geolocated tweets (geo or place not empty)
      raw.forEach((tweet) => {
        if (tweet.place != null) {
          var location = null;
          if (tweet.place.bounding_box.type == "Polygon") {
            location = Turf.centroid(tweet.place.bounding_box);
          } else {
            location = tweet.place.bounding_box;
          }

          //Create new file for MongoDB
          var file = {
            id: tweet.id_str, //Tweet ID (String)
            location: location.geometry, //Place polygon (GeoJSON object)
            text: tweet.text, //Content of the tweet
            language: tweet.lang, //Language of the tweet
            date: tweet.created_at //Date of creation
          };

          //Add file to MongoDB
          TweetModel.create(file)
            .catch(error => console.log("Error: Tweet could not be inserted into database. " + error));
        };
      });
    };
  });
  res.send();
};

exports.getV1TwitterTweets = async (req, res) => {

  var warnings = await WarningModel.find({}, { geometry: 1, _id: 0 }).exec();

  var geometries = [];

  await warnings.forEach((w) => {
    geometries.push(w.geometry);
  });

  var tweets = [];

  await geometries.forEach(async (g) => {
    var query = await TweetModel.find({
      location: {
        $geoWithin: {
          $geometry: g
        }
      }
    }).catch(error => console.log(error));

    tweets.push(query);
  });

  res.send(tweets);
};

exports.postV1DWDEventsInit = async (req, res) => {
  var result = null;
  WFS.getFeature({
    url: 'https://maps.dwd.de/geoserver/dwd/ows',
    typeName: 'dwd:Warnungen_Landkreise',
    service: 'WFS',
    request: 'GetFeature',
    format_options: 'callback:getJson',
    SrsName: 'EPSG:4326'
  }, async (error, res) => {
    if (error) {
      console.log(error)
    } else {
      await WarningModel.deleteMany({});
      var warnings = res.features;
      warnings.forEach((warning) => {
        var file = {
          type: warning.type,
          id: warning.id,
          geometry: warning.geometry,
          geometry_name: warning.geometry_name,
          properties: warning.properties,
          bbox: warning.bbox
        };
        //Add file to MongoDB
        WarningModel.create(file)
          .catch(error => console.log("Error: Warning could not be inserted into database. " + error));
      });
    }
  });
  res.send();
};

exports.getV1DWDEventsWarnings = async (req, res) => {
  let result = await WarningModel.find({}).exec();

  let collection = {
    "type": "FeatureCollection",
    "features": result
  };

  res.json(collection);
};

exports.getV1dwdradar = (req, res) => {

};

//TODO: (work in progress)
exports.getV1mapbox = async (req, res) => {
  res.send(null);
  /*
  const style = req.params.style;
  const tilesize = req.params.tilesize;
  const scale = req.params.scale;
 
  var styleVersion = null;
  var scaleString = "";
 
  var result = null;
 
  if ((style == "streets") || (style == "outdoors") || (style == "satellite-streets")) {
    styleVersion = "-v11";
  };
 
  if ((style == "light") || (style == "dark")) {
    styleVersion = "-v10";
  };
 
  if ((style == "satellite")) {
    styleVersion = "-v9";
  };
 
  if ((style == "navigation-preview-day") || (style == "navigation-preview-night") || (style == "navigation-guidance-day") || (style == "navigation-guidance-night")) {
    styleVersion = "-v4";
  };
 
  if (styleVersion == null) {
    //ERROR: The specified style is not available.
  };
 
  if ((tilesize != "256") || (tilesize != "512")) {
    //ERROR: Tilesize must be either 256 or 512
  };
 
  if (scale == "2") {
    scaleString = "@2x";
  } else {
    if (scale != "1") {
      //ERROR: Scale must be either 1 or 2
    }
  }
 
  const url = 'https://api.mapbox.com/styles/v1/mapbox/' + style + styleVersion + '/tiles/' + tilesize + '/1/1/0' + scaleString + '?access_token=' + Tokens.mapbox_accessToken;
 
  await Https.get(url, (res) => {
    let result = null;
 
    // A chunk of data has been recieved.
    res.on('data', (chunk) => {
      result += chunk;
    });
 
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
 
  res.send(result);
  */
}; 