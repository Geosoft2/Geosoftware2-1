// jshint esversion: 6
// jshint node: true
"use strict";

//Import modules
const express = require('express'); //Express
const Instagram = require('node-instagram').default;

//Import config files
var Tokens = require('../config/tokens.js'); //Access Tokens

//Define Variables
const router = express.Router();
const redirectUri = 'https://localhost:3000/auth/instagram/callback';

// Create a new instance.
const instagram = new Instagram({
    clientId: Tokens.instagram_app_id,
    clientSecret: Tokens.instagram_app_secret,
  });
  /*
// Redirect user to instagram oauth
router.get('/', (req, res) => {
    res.redirect(instagram.getAuthorizationUrl(redirectUri, { scope: ['user_profile,user_media'] }));
  });


// Handle auth code and get access_token for user
router.get('/callback', async (req, res) => {
    try {
        const data = await instagram.authorizeUser(req.query.code, redirectUri);
        console.log(data);
        // access_token in data.access_token
        res.json(data);
        
    } catch (err) {
        res.json(err);
        
    }
});
*/
module.exports = router;