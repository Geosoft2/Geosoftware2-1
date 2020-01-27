// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const Twit = require('twit'); //twit library to access the Twitter API
const WFS = require('wfs'); //wfs library to request data from DWD's wfs service
const Turf = require('@turf/turf'); //turf library for geospatial filtering

//Import config files
const Tokens = require('../config/tokens.js'); //Access Tokens
const Settings = require('../config/server.js'); //Import settings

//Import Models
const TweetModel = require('../models/tweet.js'); //MongoDB Schema definition to store tweets
const WarningModel = require('../models/warning.js'); //MongoDB Schema definition to store dwd warnings

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

          //Add file to MongoDB
          TweetModel.create(file)
            .catch(error => console.log("Error: Tweet could not be inserted into database. " + error));
        };
      });
    };
  });
  res.send({}); //TODO: Send appropriate response
};

exports.getV1TwitterTweets = async (req, res) => {

  var warnings = await WarningModel.find({}, { geometry: 1, _id: 0 }).exec();

  var geometries = [];

  await warnings.forEach((w) => {
    geometries.push(w.geometry);
  });

  var tweets = [];

  for (const polygon of geometries) {
    var result = await getTweetsInsidePolygon(polygon);

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
      }).catch(error => console.log(error));

      resolve(query);
    });
  }
};

async function pushToTweetArray(geom) {
  var tweet
  var query = await TweetModel.find({
    location: {
      $geoWithin: {
        $geometry: geom
      }
    }
  }).catch(error => console.log(error))
  //oder eben das tweets Array global außerhalb der funktionen inizialisieren und dann kannst du hier auch wieder da reinpushen und von oben aufrufen
  //aber weiß nicht ob das klappen würde
  //tweets.push(query);
  return tweet
}

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