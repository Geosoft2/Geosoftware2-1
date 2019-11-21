// jshint esversion: 6
// jshint node: true
"use strict";


/**
* @desc Geosoftware 2;
* application to render the index page
*/

/**
* @desc renders the index page
* @param {object} req request, containing information about the HTTP request
* @param {object} res response, to send back the desired HTTP response
*/
exports.getIndex = (req, res) => {
  var bboxleft = [];
  var bboxright = [];
  var start = [];
  var expansion = 10;
  var search = "";

//TODO die einzelnen Eingaben müssen darauf überprüft werden ob sie richtig sind und ob sie genügen
//so darf beispielsweise nur eine BBox übernommen werden, wenn sowohl linke obere als auch kinke untere Ecke angegeben sind
  if (!(Object.keys(req.query).length === 0)){
    bboxleft = req.query.id;
  };


  //res.send('start: ' + start);


  res.render('index', {
    title: 'Index'
    });
};


exports.getTest = (req, res) => {

  var id = "Es wurde kein Parameter angegeben";

  if (!(Object.keys(req.query).length === 0)){
    id = req.query.id;
  };


  res.send('id: ' + id);

};
