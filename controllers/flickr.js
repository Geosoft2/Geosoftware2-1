// jshint esversion: 6
// jshint node: true
"use strict"

//Import config files
var Tokens = require('../config/tokens.js') //Access Tokens
//Import modules
const cache = require('../middlewares/cache.js') //cache middleware
const mongoose = require('mongoose') 
const request = require('request');
const moment = require('moment');
const Flickr = require('flickr-sdk')
var flickr = new Flickr(Tokens.flickr_app_key)

//Import Models
const flickrModel = require('../models/flickr.js') //MongoDB Schema definition to save flickr
//import flickrGroupModel from '../models/flickr_group.js'; //MongoDB Schema definition to save flickr

/**
 * @desc function to get the latest flickr photos
 * @param {json} req 
 * @param {json} res Contains all flickr photos found
 */
exports.getPublic = (req, res)=>{
  
var group
if(req.query.group_id!=""&&req.query.group_id!=undefined){
  //searching photos for whole area of Germany
  group = req.query.group_id
  console.log('froup:', group)
  flickr.groups.pools.getPhotos({
    //bbox: '5.98865807458, 47.3024876979, 15.0169958839, 54.983104153',
    //has_geo: '1',
    group_id: group
  }).then(function (response) {
    for (var i = 0; i < response.body.photos.photo.length; i++) {
      var photoElement = response.body.photos.photo[i];
      flickr.photos.getInfo({
        photo_id: photoElement.id
      }).then( function (response) {
        var p = response.body.photo;
        var theDate= Date.parse(p.dates.taken);   
        //console.log('dateHEIEHIE:', dateHEIEHIE);
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
        const now = new Date();
        var older_than = moment().subtract(12, 'hours').toDate();
        console.log("now",older_than);
        flickrModel.find({timestamp:{$lt: older_than}}).remove().exec()
          .then((RemoveStatus) => {
            console.log("Documents Removed Successfully");
           })
           .catch((err) => {
            console.error('something error');
            console.error(err);
           });
        flickrModel.find({}).limit(50).exec(function (err, results) {
          res.header("Content-Type",'application/json');
          res.send(JSON.stringify(results, null, 4));
      });    
      } catch (err) {
        throw err;
      }
      })
    .catch(function (err) {
      console.error('ERROR', err);
    });
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
        var theDate= Date.parse(p.dates.taken);   
        //console.log('dateHEIEHIE:', dateHEIEHIE);
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
        const now = new Date();
        var older_than = moment().subtract(12, 'hours').toDate();
        console.log("now",older_than);
        flickrModel.find({timestamp:{$lt: older_than}}).remove().exec()
          .then((RemoveStatus) => {
            console.log("Documents Removed Successfully");
           })
           .catch((err) => {
            console.error('something error');
            console.error(err);
           });
        flickrModel.find({}).limit(50).exec(function (err, results) {
          res.header("Content-Type",'application/json');
          res.send(JSON.stringify(results, null, 4));
      });    
      } catch (err) {
        throw err;
      }
      })
    .catch(function (err) {
      console.error('ERROR', err);
    });
}
  
    
} 


/**
 * @desc function to get all flickr photos of one group
 * @param {json} req contains the id of the group you would like to search for
 * @param {json} res Contains all flickr photos found in the group
 */
  /*
export function getGroup(req, res){
  var group_id = req.params.group_id;

  flickr.groups.getInfo({
    group_id: group_id
  }).then(function (response){
    console.log("kakaka", response.body);
  })
  flickr.photos.search({
    bbox: '5.98865807458, 47.3024876979, 15.0169958839, 54.983104153',
    has_geo: '1',
    group_id: group_id
  })
  .then(function (response) {
    for (var i = 0; i < response.body.photos.photo.length; i++) {
      var photoElement = response.body.photos.photo[i];
      flickr.photos.getInfo({
        photo_id: photoElement.id
      }).then(function (response) {
        var p = response.body.photo;
        //save the data of a photo in the Database
        flickrModel.create({
          photo_id: p.id,
          title: p.title._content,
          description: p.description._content,
          latitude: p.location.latitude, 
          longitude: p.location.longitude,
          url: p.urls.url[0]._content,
          user_id: p.owner.nsid,
          user_name: p.owner.username,
          timestamp: $toDate (p.dates.taken)
      }, function (err, photo) {
        if (err) return handleError(err)
        // saved!
      });
    });
    };
    try {
      flickrModel.deleteMany({timestamp:{$lt: dateMinus}})
      flickrModel.find({}).exec(function (err, results) {
        res.header("Content-Type",'application/json')
        res.send(JSON.stringify(results, null, 4))
    });
    
    } catch (err) {
      throw err
    }
    //console.log('result:', result)

    //res.send("hi")
  }).catch(function (err) {
    console.error('ERROR', err)
  });
}; 
*/

/**
 * @desc function to get flickr photos
 * @param {json} req contains a bbox (required), reload (optional), group_id (optional)
 * @param {json} res Contains all flickr photos found
 */
exports.loadPhotos = (req,res)=>{
  //if you just want to load from database
  if(req.query.reload == "false"|| req.query.reload == "" || req.query.reload == undefined){
    //all of a group
    if(req.query.group_id!=""&&req.query.group_id!=undefined){
      find({'group_id': req.query.group_id}).limit(50).exec(function (err, result) {
        res.send(result)
      })
    }
    //or all public photos
    else{
      find({}).limit(50).exec(function (err, result) {
        res.send(result)
      }) 
    }
  }
  else{
    //want to get new data from flickr API?
    if(req.query.reload =="true"){
      loadFlickrPhotos(req)
    }
    else{
      return res.sendStatus(400).json({
        error: 'The input '+ req.query.reload + "for the parameter reload is not acceptable."
      })
    }
  }
}


async function loadFlickrPhotos (req){
//searching photos from the given group

var group
  if(req.query.group_id!=""&&req.query.group_id!=undefined){
    //searching photos for whole area of Germany
    group = req.query.group_id
    var searchresult= flickr.photos.search({
      bbox: '5.98865807458, 47.3024876979, 15.0169958839, 54.983104153',
      has_geo: '1',
      group_id: req.query.group_id
    })
  }
  else{
    //searching photos for whole area of Germany
    group = ""
    var searchresult = flickr.photos.search({
      bbox: '5.98865807458, 47.3024876979, 15.0169958839, 54.983104153',
      has_geo: '1'
    })
  }
    //await die ausgabe jenachdem ob if oder else
    async function savetoDB(){
      var searchdone = await searchresult
      for (const pic in searchdone.body.photos.photo) {
        //TODO: die for schleife muss asynchron laufen sodass unten das aufrufen aus der db erst nach beendigung läuft
        await flickr.photos.getInfo({
          photo_id: pic.id
        }).then(function (response) {
            var p = response.body.photo;
            //save the data of a photo in the Database
            replaceOne(
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
            if (err) return handleError(err)
            });
            console.log("done")
          })
        }
      }
      const saved = await savetoDB
      loadfromDB(saved)

}

async function loadfromDB(callback){
  try {
    const promise2 = await deleteoldPhotos("test")
    loadIT (promise2)     
  } catch (err) {
    throw err;
  }
}

async function loadIT (callback){
  find({}).limit(50).exec(function (err, results) {
    res.json(results)
    //res.header("Content-Type",'application/json')
    //res.send(JSON.stringify(results, null, 4))
  })
}
async function deleteoldPhotos (callback){
  const now = new Date();
  var older_than = moment().subtract(24, 'hours').toDate()
  console.log("Date from " + older_than + " to " + now + "loaded")
  find({timestamp:{$lt: older_than}}).remove().exec()
      .then((RemoveStatus) => {
        console.log("Documents Removed Successfully")
      })
      .catch((err) => {
        console.error('something error')
        console.error(err)
      })
}
  



exports.test = (req, res)=>{
    flickr.photos.search({
      bbox: '5.98865807458, 47.3024876979, 15.0169958839, 54.983104153',
      has_geo: '1',
      page: '2'
    })
      .then(function (response) {
        for (var i = 0; i < response.body.photos.photo.length; i++) {
          var photoElement = response.body.photos.photo[i];
          //TODO: die Funktion auslagern und für mehrere Pages dürchführen
          flickr.photos.getInfo({
            photo_id: photoElement.id
          }).then(function (single){
            console.log(single.body.photo);
            
          })
        }
        res.send("hi");
    })
}
