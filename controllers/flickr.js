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
var WarningModel = require('../models/warning.js');
var flickrModel = require('../models/flickr.js'); //MongoDB Schema definition to save flickr

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @description this is the function for the flickr endpoint it will check the req.query if available and give back a JSON of flickr pictures taken in the last 48h
 * @param {JSON} req
 * req.query could depend of:
 * {Array of 4 values->lowerleft corner and upper right} bbox: filter the pictures at the end with a bbox
 * {boolean} reload: should the endpoint reload data from the flickr API or not. true=yes. default=no
 * keyword: a String to filter title and description of the results pictures
 * group_id: a String with depends of the group_id and loads only pictures of a spezified flickr group (should be public like the pictures as well).
 *          Default=set the group ID to "" and give back all public pictures from the last 48h
 * @param {JSON} res
 */
async function loadPhotos (req, res){
  //for flickr API
  var relo = req.query.reload
    if (relo == "true"){var reload = true}
    else{var reload = false}
  //for loading from DB
  if(req.query.bbox!= undefined){
    var bboxslice = req.query.bbox.slice(1,-1)
    var bboxsplit = bboxslice.split(",")
    var bbox = []
    bboxsplit.forEach (coord =>{ 
        bbox.push(+coord)
        })

    }  
  var keyword
    if (req.query.keyword != undefined){keyword = req.query.keyword}
    else{keyword=""}
  var location_filter = req.query.location_filter
  //for both
  var group_id
    if (req.query.group_id != undefined){group_id = req.query.group_id}
    else{group_id = ""}

  if (reload === true){
    console.log("reload Flickr data")
    const foundPictures = await groupOrNot(group_id, location_filter)
    const photosFound = await foundPictures
    const allSaved = await Promise.all(photosFound.body.photos.photo.map(async(pic) => await eachPic(pic, group_id)))
    var allUpdated = await removeOldPhotos(allSaved)
  }
  const readyToLoad = await allUpdated
  var picturesKey = await filterOrNot(readyToLoad, keyword, group_id, location_filter, bbox)
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
 * this function checks of the group_id is given or if its default= ""
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
 * this function requests the flickr API and gives back the photos that are posted in the given public group like "Salus Solutions"
 * @param {Stirng} group_id
 */
async function groupReqFlickr(group_id){
  var group = group_id
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
 * @description this saves a Flickr photo to the database cache
 * @param {*} request
 */
async function saveToDB(req, group_id){
        var group = group_id
        var p = req.body.photo;
        var point = {type: "Point", coordinates: [+(p.location.longitude), +(p.location.latitude)]}
        //save the data of a photo in the Database
        var picsaved = flickrModel.replaceOne(
            {photo_id: p.id},
            {photo_id: p.id,
            secret: p.secret,
            server:p.server,
            farm:p.farm,
            title: p.title._content,
            description: p.description._content,
            location: point,
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
 * this function initializes the search for details of every single picture given and the saving to DB cache
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
 * this function requests the Flickr API and searches the details for one given photo_id
 * @param {JSON} req
 */
async function getPictureDetails(req){
    const res = flickr.photos.getInfo({
      photo_id: req.id
    })
    return res
}
/**
 * This function deletes all photos from our Flickr DB that are older than 48 hors
 * @param {callback} ready
 */
async function removeOldPhotos(ready){
  try{
    var older_than = moment().subtract(80, 'hours').toDate()
        var removed = flickrModel.find({timestamp:{$lt: older_than}}).remove().exec()
        return removed
  }
  catch (err) {
    console.error('Data could not be deleted. There has been an ERROR occured', err)
    return err
  }
}

/**
 * function to check if there are filters set or not and depending on that making requests to our DB andn giving back the photos as an JSON
 * @param {*} callback 
 * @param {String} keyword 
 * @param {String} group_id 
 * @param {String} location_filter 
 * @param {Array} bbox an array with a bbox to filter the pictures. if not given then its undefined
 */
async function filterOrNot(callback, keyword, group_id, location_filter, bbox){
  var bbox = bbox
  var key = keyword
  var group = group_id
  var loc_filter = location_filter
    //TODO: the filter for DWD warn layer does not work. but we dont know why. Copyed and tried everthing with the filter method from twitter.js but still there is an error
    //if(loc_filter!=undefined){
        //var picturesKey = await dwdFilterFlickr(key, group)   
      if(bbox!=undefined){
        var picturesKey = await BboxFilter(bbox, key, group) 
      }
      else{
        var picturesKey = await flickrModel.find({'$and':[{group_id: group},{'$or': [{"title": {'$regex' : '.*' + keyword + '.*'}},{"description": {'$regex' : '.*' + keyword + '.*'}}]}]}).exec()
      }
    //}
    /*else{
      if(bbox!=undefined){
        var picturesKey = await BboxFilter(bbox) 
      }
      else{
        var picturesKey = await flickrModel.find({'$and':[{group_id: group},{'$or': [{"title": {'$regex' : '.*' + keyword + '.*'}},{"description": {'$regex' : '.*' + keyword + '.*'}}]}]}).exec()
      }
    }  */
     return picturesKey
}

/**
 * function to filter the pictures saved in the DB lay inside the current saved dwd warnlayer
 * @param {String} keyword a search word
 * @param {String} group_id the id of a Flickr group. if not given it is ""
 */
async function dwdFilterFlickr (keyword, group_id){
  var key = keyword
  var group = group_id  
  var warnings = await WarningModel.find({}, { geometry: 1, _id: 0 }).exec()

  var picturesKey = await flickrModel.find({'$and':[{group_id: group},{'$or': [{"title": {'$regex' : '.*' + key + '.*'}},{"description": {'$regex' : '.*' + keyword + '.*'}}]}]}).exec()  

  const allGeometries = await Promise.all(warnings.map(async(w) => await geometriesEY(w)))
 
  var filteredPictures = [];
  const allInFilteredPictures = await Promise.all(allGeometries.map(async(polygon) => await gimmi(polygon)))
  return filteredPictures


return allInFilteredPictures

}


/**
 * returns the result of the getFlickrInsidePolygon function
 * @param {array} polygon 
 */
async function getResult  (polygon){
  var result = await getFlickrInsidePolygon(polygon)
return result
}

/**
 * @desc checks if points saved in our Flickr DB lay inside a polygon
 * @returns a array containing JSON of points that are inside the polygon
 */
async function getFlickrInsidePolygon(polygon) {
  var poly = polygon
    var answer = await flickrModel.find(
      {
        location: {
          $geoWithin: {
            $geometry: poly
                
            }
          }
        }).catch(error => console.log(error))
return answer
}

async function geometriesEY (w){
  return w.geometry
}

async function BboxFilter (bbox, keyword, group_id){
  var bb = bbox
  var key = keyword
  var group = group_id

  var answer = await flickrModel.find({'$and':[
    {
      location: {
        $geoWithin: { $box:  [ [ bb[0], bb[1] ], [ bb[2], bb[3] ] ] }
        }
      }
      ,{group_id: group}
      ,{'$or': [{"title": {'$regex' : '.*' + keyword + '.*'}},{"description": {'$regex' : '.*' + keyword + '.*'}}]}]}).catch(error => console.log(error))
return answer
}
