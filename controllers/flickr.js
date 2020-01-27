// jshint esversion: 6
// jshint node: true
"use strict"

//Import config files
var Tokens = require('../config/tokens.js') //Access Tokens
//Import modules
var cache =  require('../middlewares/cache.js')
var mongoose =  require('mongoose')
var request =  require('request')
var moment = require('moment')
var Flickr =  require('flickr-sdk')
var flickr = new Flickr(Tokens.flickr_app_key)

//Import Models
var flickrModel = require('../models/flickr.js'); //MongoDB Schema definition to save flickr
//import flickrGroupModel from '../models/flickr_group.js'; //MongoDB Schema definition to save flickr

/**
 * @desc function to get the latest flickr photos
 * @param {json} req 
 * @param {json} res Contains all flickr photos found
 */
exports.getPublic = (req, res)=>{
  var group
  var bbox = req.query.bbox
  if(req.query.group_id!=""&&req.query.group_id!=undefined){
  //searching photos for whole area of Germany
  /*
  if (flickrModel.find({}).count.exec() == 0){
    var page = 4
  }
  else{
    var page = 1
  }
  */
  // for (page; page>=1;page--){}
  group = req.query.group_id
  flickr.groups.pools.getPhotos({
    group_id: group
  }).then(function (response) {
    for (var i = 0; i < response.body.photos.photo.length; i++) {
      var photoElement = response.body.photos.photo[i]
      flickr.photos.getInfo({
        photo_id: photoElement.id
      }).then( function (response) {
        var p = response.body.photo 
        //save the data of a photo in the Database
        flickrModel.replaceOne(
          {photo_id: p.id},
          {photo_id: p.id,
          title: p.title._content,
          description: p.description._content,
          latitude: p.location.latitude, 
          longitude: p.location.longitude,
          url: p.urls.url[0]._content,
          user_id: p.owner.nsid,
          user_name: p.owner.username,
          grou_id: group,
          timestamp: p.dates.taken},
          { upsert: true }, function (err, photo) {
        if (err) return handleError(err)
      });
    
      });
      };
     }).then(function (){
      try {
        const now = new Date();
        var older_than = moment().subtract(12, 'hours').toDate();
        console.log("now",older_than)
        flickrModel.find({timestamp:{$lt: older_than}}).remove().exec()
          .then((RemoveStatus) => {
            console.log("Documents Removed Successfully")
           })
           .catch((err) => {
            console.error('something error');
            console.error(err)
           });
        flickrModel.find({}).limit(50).exec(function (err, results) {
          res.header("Content-Type",'application/json')
          res.send(JSON.stringify(results, null, 4))
      });    
      } catch (err) {
        throw err;
      }
      })
    .catch(function (err) {
      console.error('ERROR', err)
    });
    //TODO: wenn es Updates gab in der Datenbank dann wird auchnoch die nächste seite der API abgerufen
    /*
    if(updateCout == 0){
      //da nur die ersten 6 Seiten gesucht werden sollen maximal, da 1500 bilder schon ordentlich sind
      //bei 7 wird die schleife ja beendet
      page = 7
    }
    */
}
else{
  //searching photos for whole area of Germany
  group = ""
  flickr.photos.search({
    bbox: '5.98865807458, 47.3024876979, 15.0169958839, 54.983104153',
    has_geo: '1'
  }).then(function (response) {
    for (var i = 0; i < response.body.photos.photo.length; i++) {
      var photoElement = response.body.photos.photo[i];
      flickr.photos.getInfo({
        photo_id: photoElement.id
      }).then( function (response) {
        var p = response.body.photo;
        //save the data of a photo in the Database
        flickrModel.replaceOne(
          {photo_id: p.id},
          {photo_id: p.id,
          title: p.title._content,
          description: p.description._content,
          latitude: p.location.latitude, 
          longitude: p.location.longitude,
          url: p.urls.url[0]._content,
          user_id: p.owner.nsid,
          user_name: p.owner.username,
          grou_id: group,
          timestamp: p.dates.taken},
          { upsert: true }, function (err, photo) {
        if (err) return handleError(err);
        // saved!
      });
    
      });
      };
     }).then(function (){
      try {
        const now = new Date()
        var older_than = moment().subtract(12, 'hours').toDate()
        console.log("now",older_than)
        flickrModel.find({timestamp:{$lt: older_than}}).remove().exec()
          .then((RemoveStatus) => {
            console.log("Documents Removed Successfully");
           })
           .catch((err) => {
            console.error('something error')
            console.error(err)
           });
           //TODO: hier noch einbauen dass die besten 50 für eine Region gesucht werden
           // find lat lon in bbox die mit der Funktion mitgegeben wird
           //$box: [
             //TODO: hier muss dann irgendiwe die bbox sache auseinandergezogen werden
             //oder irgendwie die vier werte in ein array umwandeln
             //split
             // [bbox]
           //]
        if (group!=""){
          flickrModule.find({group_id: group}).limit(50).exec(function (err, results) {
            res.header("Content-Type",'application/json')
            res.send(JSON.stringify(results, null, 4))
          });    
        }
        else{
          flickrModel.find({}).limit(50).exec(function (err, results) {
            res.header("Content-Type",'application/json')
            res.send(JSON.stringify(results, null, 4))
          });    
        }  
      } catch (err) {
        throw err
      }
      })
    .catch(function (err) {
      console.error('ERROR', err)
    });
}    
} 

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function loadPhotos (req, res){
  //for flickr API
  var relo = req.query.reload
  if (relo == "true"){var reload = true}
  else{var reload = false}
  console.log('reload:', reload)
  //for loading from DB
  var keyword
  if (req.query.keyword != undefined){keyword = req.query.keyword}
  else{keyword=""}
  var bbox = req.query.bbox
  //for both
  var group_id
  if (req.query.group_id != undefined){group_id = req.query.group_id}
  else{group_id = ""}
  if (reload === true){
    console.log('tesdt:')
    const foundPictures = await groupOrNot(group_id)
    const photosFound = await foundPictures
    const allSaved = await Promise.all(photosFound.body.photos.photo.map(async(pic) => await eachPic(pic, group_id)))
    var allUpdated = await removeOldPhotos(allSaved)
  }
  const readyToLoad = await allUpdated
  //var loadedPictures = await loadDataDB(readyToLoad, group_id)
  
  var picturesKey = await filterOrNot(readyToLoad, keyword, group_id)
  var returnPics = picturesKey
  res.send(returnPics)
}
exports.loadPhotos = loadPhotos

/**
 * 
 * @param {String} group_id 
 */
async function groupOrNot(group_id){
  var group = group_id
  if (group != "" ){
    var foundPictures = await groupReqFlickr(group)
  }
  else{
    var foundPictures = await publicReqFlickr()
  }
  return foundPictures
 }
 

/**
 * 
 * @param {Stirng} group_id 
 */
async function groupReqFlickr(group_id){
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
async function publicReqFlickr(){
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
async function saveToDB(req, group_id){
        var group = group_id
        var p = req.body.photo;  
        //save the data of a photo in the Database
        var picsaved = flickrModel.replaceOne(
            {photo_id: p.id},
            {photo_id: p.id,
            title: p.title._content,
            description: p.description._content,
            latitude: p.location.latitude, 
            longitude: p.location.longitude,
            url: p.urls.url[0]._content,
            user_id: p.owner.nsid,
            user_name: p.owner.username,
            group_id: group,
            timestamp: p.dates.taken},
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
async function eachPic(pic, group_id){
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
async function getPictureDetails(req){
    const res = flickr.photos.getInfo({
      photo_id: req.id
    })
    return res
} 
/**
 * 
 * @param {callback} ready 
 */
async function removeOldPhotos(ready){
  try{
    var older_than = moment().subtract(48, 'hours').toDate()
        console.log("now",older_than)
        var removed = flickrModel.find({timestamp:{$lt: older_than}}).remove().exec()
        return removed
  }
  catch (err) {
    console.error('Data could not be deleted. There has been an ERROR occured', err)
    return err
  }
}


async function filterOrNot(callback, keyword, group_id){
  var key = keyword
  console.log('key:', key)
  var group = group_id
  console.log('group:', group)
    if (key !="" && key!=undefined){
      var picturesKey = await flickrModel.find({'$and':[{group_id: group},{'$or': [{"title": {'$regex' : '.*' + keyword + '.*'}},{"description": {'$regex' : '.*' + keyword + '.*'}}]}]}).exec()
      console.log('dies:')
    }
     else {
       var picturesKey = await flickrModel.find({group_id: group}).limit(50).exec()
       console.log('das:')
     }
     return picturesKey
}

/**
 * 
 * @param {callback} ready 
 */
async function loadDataDB (group_id){
  var keyw = keyword
  var group = group_id
  //console.log(group)
  try {
    //TODO: the filtering of the group is right now not possible
    const loadedPictures = flickrModel.find({group_id: group}).limit(250).exec()
    return loadedPictures
  } catch (err) {
    console.error('Data could not be loaded. There has been an ERROR occured', err);
    throw err
  }
}
/**
 * 
 * @param {*} keyword 
 */
async function keywordFilter (keyword){
  var key = keyword
  var filterdPics = await flickrModel.find({'$or': [{"title": {'$regex' : '.*' + keyword + '.*'}},{"description": {'$regex' : '.*' + keyword + '.*'}}]})
  //TODO: hier die funtkion ergänzen die die Bilder auf das keyword filtert
  return filterdPics
}