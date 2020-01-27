/**
 * This module contains configurable settings for server sided functions.
 */

//Set filtering parameters for Twitter Search API
exports.twitter_query = {
    q: "", //Keywords
    geocode: "51.158627,10.445921,400km", //("LNG,LAT,RADIUS") - Center of Germany
    lang: "", //Tweet language
    locale: "ja", //[ja]
    result_type: "mixed", //[mixed, recent, popular]
    count: "100", //Number of tweets per request
    until: "", //Date
    since_id: "", //Tweets starting with a specific id
    max_id: "", //Maximum id
    include_entities: false //Include additional information 
};