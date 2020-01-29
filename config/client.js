/**
 * This module contains configurable settings for client sided functions.
 */

//Set the interval for requesting new Tweets from the Twitter API
const twitterInterval = 10; //seconds
const flickrInterval = 300;
const warningInterval = 480;
const radarInterval = 480;

//Set appearance for the Tweet visualization on the App's User Interface
const widget_config = {
    conversation: 'none',  // Show conversation [none, all]
    cards: 'hidden',  // Show cards [hidden, visible]
    linkColor: '#cc0000', // Color of links within the tweet [Colorcode]
    theme: 'dark'    // Color scheme [light, dark]
};

const url_getTweets = 'http://localhost:3000/api/v1/twitter/tweets';