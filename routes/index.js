// jshint esversion: 6
// jshint node: true
"use strict";

const router = require('express').Router();


//@description  renders the main page
router.get('/', (req, res) => {
    res.render('index', {
      title: 'Index'
      });
  });
  
/*
////////////////////////////////////////////////////INSTAGRAM//////////////////////////////////////////////////////////////////////////////////////
//TODO: noch alles an die richtigen stellen platzieren fertig
  const request = require("request");
  const Instagram = require('node-instagram').default;
  const redirectUri = 'https://localhost:3000/auth/instagram/callback';
  //Import config files
var Tokens = require('../config/tokens.js'); //Access Tokens
//Import Models
var InstaModel = require('../models/instagram.js'); //MongoDB Schema definition to save instagram posts

  // Create a new instance.
const instagram = new Instagram({
  clientId: Tokens.instagram_app_id,
  clientSecret: Tokens.instagram_app_secret,
});
  

// Redirect user to instagram oauth
router.get('/auth/instagram', (req, res) => {
  res.redirect(instagram.getAuthorizationUrl(redirectUri, { scope: ['user_profile,user_media'] }));
});
  // Handle auth code and get access_token for user
router.get('/auth/instagram/callback', async (req, res) => {
  try {
    console.log("done");
    console.log(req.query.code);
    
    try{
      var data = await instagram.authorizeUser(req.query.code, redirectUri);
*/
      /*
      var data = request(
        'POST',
        'https://api.instagram.com/oauth/access_token',
        {
          uriAbsolute: true,
          code: req.query.code,
          redirect_uri: redirectUri,
          client_id: Tokens.instagram_app_id,
          client_secret: Tokens.instagram_app_secret,
          grant_type: 'authorization_code',
        });
        */
  /*
        console.log("DONEDONEDONE");
        //var code = req.query.code;
        // access_token in data.access_token
        //res.json(data);
        var userShortToken = data.access_token;
        try{
          var longTerm; 
          request('https://graph.instagram.com/access_token?grant_type=ig_exchange_tokenclient_secret='+Token.instagram_app_secret+ '&access_token='+userShortToken, function (error, response, body) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body); 
            longTerm = body;
            //TODO: ist das richtig so in die mongo gespeichert?
            var saveToMongo = new InstaModel({"access-token": body.access-token});
            console.log(saveToMongo);
            res.json(longTerm);
          });
        }
        catch (err){
           //TODO: hier in diesen catches vielleicht die Startseite unserer App rendern und die ERrormeldung auf der Seite in einer message anzeigen
          console.log("ERROR long term token get");
          res.json(err);
        }
    }
    catch (err){
      //TODO: hier in diesen catches vielleicht die Startseite unserer App rendern und die ERrormeldung auf der Seite in einer message anzeigen
      res.json(err);
    }
  } catch (err) {
     //TODO: hier in diesen catches vielleicht die Startseite unserer App rendern und die ERrormeldung auf der Seite in einer message anzeigen
    //var usercode = req.query.code;
    console.log(req.query.code);
    console.log("ERROR");
    const data = await instagram.authorizeUser(req.query.code, redirectUri);
    res.json(data);
    //res.json(err);
  }
});
*/
module.exports = router;
