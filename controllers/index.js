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

//TODo hier muss noch ein fall rein, wenn  /?cookie.policy abgefragt wird, rein
//dann wird ein popup mit der cookie policy angezeigt oder eine neue Seite

    //TODO außerdem sollen bei falschen werten und bei nicht existierenden Anfragen ein Fahler geworfen werden

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
