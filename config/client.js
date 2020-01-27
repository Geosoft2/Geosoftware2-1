/**
 * This module contains configurable settings for client sided functions.
 */

//Set the interval for requesting new Tweets from the Twitter API
const interval = 10; //seconds

//Set appearance for the Tweet visualization on the App's User Interface
const widget_config = {
    conversation: 'none',  // Show conversation [none, all]
    cards: 'hidden',  // Show cards [hidden, visible]
    linkColor: '#cc0000', // Color of links within the tweet [Colorcode]
    theme: 'dark'    // Color scheme [light, dark]
};