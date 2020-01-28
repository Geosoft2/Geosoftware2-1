// jshint esversion: 6
// jshint node: true
"use strict"

//Import config files
var Tokens = require('../config/tokens.js') //Access Tokens
//Import modules
var cache = require('../middlewares/cache.js')
var mongoose = require('mongoose')
var request = require('request')
var moment = require('moment')
var Flickr = require('flickr-sdk')
var flickr = new Flickr(Tokens.flickr_app_key)

//Import Models
var WarningModel = require('../models/warning.js');
var flickrModel = require('../models/flickr.js'); //MongoDB Schema definition to save flickr

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function loadPhotos(req, res) {
  //for flickr API
  var relo = req.query.reload
  if (relo == "true") { var reload = true }
  else { var reload = false }
  console.log('reload:', reload)
  //for loading from DB
  var keyword
  if (req.query.keyword != undefined) { keyword = req.query.keyword }
  else { keyword = "" }
  var location_filter = req.query.location_filter
  //for both
  var group_id
  if (req.query.group_id != undefined) { group_id = req.query.group_id }
  else { group_id = "" }

  if (reload === true) {
    const foundPictures = await groupOrNot(group_id)
    const photosFound = await foundPictures
    const allSaved = await Promise.all(photosFound.body.photos.photo.map(async (pic) => await eachPic(pic, group_id)))
    var allUpdated = await removeOldPhotos(allSaved)
  }
  const readyToLoad = await allUpdated
  var picturesKey = await filterOrNot(readyToLoad, keyword, group_id)
  var returnPics = picturesKey
  /*
  if(location_filter=undefined){
    var returnPics = picturesKey
  }
  else{
    var warnings = await WarningModel.find({}, { geometry: 1, _id: 0 }).exec()
    var returnPics = await dwdFilter(warnings, picturesKey ,location_filter)
  }
  */
  res.send(returnPics)
}
exports.loadPhotos = loadPhotos

/**
 * 
 * @param {String} group_id 
 */
async function groupOrNot(group_id) {
  var group = group_id
  if (group != "") {
    var foundPictures = await groupReqFlickr(group)
  }
  else {
    var foundPictures = await publicReqFlickr()
  }
  return foundPictures
}


/**
 * 
 * @param {Stirng} group_id 
 */
async function groupReqFlickr(group_id) {
  var group = group_id
  //console.log('group:', group)
  var flickrpic = flickr.groups.pools.getPhotos({
    group_id: group
  })
  return flickrpic
}
/**
 * @description loads public data from the Flickr API lokated in Germany with geotag
 */
async function publicReqFlickr() {
  var flickrpic = flickr.photos.search({
    bbox: '5.98865807458, 47.3024876979, 15.0169958839, 54.983104153',
    has_geo: '1'
  })
  return flickrpic
}
/**
 * @description this saves Flickr photos to the database
 * @param {*} request 
 */
async function saveToDB(req, group_id) {
  var group = group_id
  var p = req.body.photo;
  var loc = { "type": "Point", "coordinates": [p.location.longitude, p.location.latitude] };
  //save the data of a photo in the Database
  var picsaved = await flickrModel.replaceOne(
    { photo_id: p.id },
    {
      photo_id: p.id,
      secret: p.secret,
      server: p.server,
      farm: p.farm,
      title: p.title._content,
      description: p.description._content,
      location: loc,
      url: p.urls.url[0]._content,
      user_id: p.owner.nsid,
      user_name: p.owner.username,
      group_id: group,
      timestamp: p.dates.taken
    },
    { upsert: true }, function (err, photo) {
      if (err) return handleError(err);
    }
  );
  var saved = await picsaved
  return saved
}
/**
 * 
 * @param {JSON} photosFound 
 */
async function eachPic(pic, group_id) {
  var group = group_id
  const picDetails = getPictureDetails(pic)
  const detailedPic = await picDetails
  const savedPic = await saveToDB(detailedPic, group)
  return savedPic
}
/**
 * 
 * @param {JSON} req 
 */
async function getPictureDetails(req) {
  const res = flickr.photos.getInfo({
    photo_id: req.id
  })
  return res
}
/**
 * 
 * @param {callback} ready 
 */
async function removeOldPhotos(ready) {
  try {
    var older_than = moment().subtract(48, 'hours').toDate()
    console.log("now", older_than)
    var removed = flickrModel.find({ timestamp: { $lt: older_than } }).remove().exec()
    return removed
  }
  catch (err) {
    console.error('Data could not be deleted. There has been an ERROR occured', err)
    return err
  }
}

async function filterOrNot(callback, keyword, group_id) {
  var key = keyword
  console.log('key:', key)
  var group = group_id
  console.log('group:', group)
  if (key != "" && key != undefined) {
    var picturesKey = await flickrModel.find({ '$and': [{ group_id: group }, { '$or': [{ "title": { '$regex': '.*' + keyword + '.*' } }, { "description": { '$regex': '.*' + keyword + '.*' } }] }] }).exec()
    console.log('dies:')
  }
  else {
    var picturesKey = await flickrModel.find({ group_id: group }).limit(250).exec()
    console.log('das:')
  }

  var warnings = await WarningModel.find({}, { geometry: 1, _id: 0 }).exec();

  var geometries = [];

  await warnings.forEach((w) => {
    geometries.push(w.geometry);
  });

  var pictures = [];

  for (const polygon of geometries) {
    var result = await getPicturesInsidePolygon(polygon);

    result.forEach(elem => {
      pictures.push(elem);
    });
  };

  function getPicturesInsidePolygon(polygon) {
    return new Promise((resolve) => {
      var query = flickrModel.find({
        location: {
          $geoWithin: {
            $geometry: polygon
          }
        }
      }).catch(error => console.log(error));

      resolve(query);
    });
  }

  console.log(pictures);

  return pictures;
}










