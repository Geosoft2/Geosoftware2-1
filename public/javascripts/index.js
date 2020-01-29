//set intervalls for updating the database
//and do it on load of page
$(document).ready(() => {
    setInterval(() => {
        initDWDWarnings();
    }, warningInterval * 1000);
    setInterval(() => {
        initTweets();
    }, twitterInterval * 1000);
    setInterval(() => {
        axios.get('/api/v1/flickr?group_id=14643952@N25&reload=true')
        axios.get('/api/v1/flickr?reload=true')
    }, flickrInterval * 1000);
    clearUpTweets();
    initTweets();
    axios.get('/api/v1/flickr?group_id=14643952@N25&reload=true')
    axios.get('/api/v1/flickr?reload=true')
    getTweets();
    show_wfs_changes();

    document.cookie = 'flickr_keyword='
    document.cookie = 'flickr_group='
    document.cookie = 'flickr=0'
    document.cookie = 'twitter=0'
});


var url = window.location.href;
var arr = url.split("/");
var host = arr[0] + "//" + arr[2];

/**
 * @description loads tweets and cache them in DB
 */
function initTweets() {
    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/v1/twitter/init',
    }).fail(function (xhr, status, error) {
        console.log('Error: ' + error);
    });
};

/**
 * @description get tweets from our cache DB
 */
function getTweets() {
    $("#btn_tweetrequest").on("click", () => {
        var bboxSW_lng = +getCookie("bboxsouthWest_lng")
        var bboxSW_lat = +getCookie("bboxsouthWest_lat")
        var bboxNE_lng = +getCookie("bboxnorthEast_lng")
        var bboxNE_lat = +getCookie("bboxnorthEast_lat")
        giveLoadMessage("Twitter is loading", "twitter-mess")
        axios.get('/api/v1/twitter/tweets?bbox=['+bboxSW_lng+','+bboxSW_lat+','+bboxNE_lng+','+bboxNE_lat+']')
        .then(function (data) { 
            document.cookie = 'twitter=1'
            $(".twitter-mess").delay(0).fadeOut(0)
            filterTweets(data)
        })
    });
};

function clearUpTweets() {
    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/v1/twitter/clearup',
    }).fail(function (xhr, status, error) {
        console.log('Error: ' + error);
    });
};

async function initDWDWarnings() {
    await $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/v1/dwd/events/init',
    }).done(function () {
        console.log("Warnings received.");
        getDWDWarnings();
    }).fail(function (xhr, status, error) {
        console.log('Error: ' + error);
    });
};

/**
 * @description this function loads the DWD warning data from our database
 */
function getDWDWarnings() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/api/v1/dwd/events/warnings',
        dataType: 'json',
        encode: true
    }).done(function (data) {
        console.log('Success: Warnings loaded from database.');
        drawWarningsToMap(data);
    }).fail(function (xhr, status, error) {
        console.log('Error: ' + error);
    });
};

/**
 * @description filters the tweets for the given bbox
 * @param {JSON} tweets
 */
function filterTweets(tweets) {
    drawTweetsToMap(tweets)
    drawTweetsToUI(tweets)
    $(".twitter-mess").delay(0).fadeOut(0)
    $(".twitter-mess").remove()
    giveSuccessMessage("Tweets successfully loaded.")
};
/**
 * @description draw given warnings to the leaflet map
 * @param {*} warnings 
 */
function drawWarningsToMap(warnings) {
    if (tweetgroup!=undefined){
        tweetgroup.clearLayers()}
    WFSLayer = L.geoJson(warnings, {
        style: setStyles,
        onEachFeature: function (feature, layer) {
            //popupOptions = {maxWidth: 200};
            layer.bindPopup(feature.properties.EVENT + "<br><br>" + "VON: " + feature.properties.EFFECTIVE + "<br>Bis voraussichtlich: " + feature.properties.EXPIRES);
        }
    }).addTo(map);
};

/**
 * draws the given tweets to map with an twitter specified icon
 * @param {JSON} tweets
 */
function drawTweetsToUI(tweets) {
    tweets.data.forEach((tweet) => {
        var tweet_id = tweet.id;
        var tweet_html = '<div class="tweet carousel-item" id="' + tweet_id + '"></div>';
        $("#tweet_carousel_inner").append(tweet_html);
        var tweet_dom = $("#" + tweet_id)[0];
        twttr.widgets.createTweet(tweet_id, tweet_dom, widget_config);
    });

    $(".carousel-item").first().addClass("active");
};

/**
 * function to link the user to the instagram authentification
 */
/*
function instagramAuthentic(){
    window.location.href = "/auth/instagram";
}
*/

/**
 * function to get all Flickr photos in Germany and show them on the map
 * @param {boolean} reload should the system reload the FlickrAPI or not {true, false}
 */
function flickrGetPublic(reload) {
    if (flickrmarkergroup!=undefined){
    flickrmarkergroup.clearLayers()}
    var keyword = document.getElementById('keyword_input_flickr').value;
    var group = document.getElementById('flickr_select').value;

    if (group == "public"){var group_id=""}
    else{
        if (group == "Salus Solutions group"){var group_id="14643952@N25"}
        //space for further groups
    }
    //save values for this session in cookies
    //if the user changes the map extend, the values will be needed for a new request
    document.cookie = 'flickr_keyword='+keyword
    document.cookie = 'flickr_group='+group_id
    document.cookie = 'flickr=1'
    var bboxSW_lng = +getCookie("bboxsouthWest_lng")
    var bboxSW_lat = +getCookie("bboxsouthWest_lat")
    var bboxNE_lng = +getCookie("bboxnorthEast_lng")
    var bboxNE_lat = +getCookie("bboxnorthEast_lat")
    giveLoadMessage("Flickr is loading", "flickr")
    axios.get('/api/v1/flickr?reload=' + reload+'&group_id='+group_id+'&keyword='+keyword+'&bbox=['+bboxSW_lng+','+bboxSW_lat+','+bboxNE_lng+','+bboxNE_lat+']')
        .then(function (response) {
            console.log("respomse",response)
            drawFlickrToMap(response)
            drawFlickrToUI(response)

            $(".flickr").delay(0).fadeOut(0)
            $(".flickr").remove();
            giveSuccessMessage("Flickr photos have successfully been loaded.")
        })
        .catch(function (error) {
            $(".flickr").delay(0).fadeOut(0)
            $(".flickr").remove();
            giveErrorMessage("An error with Flickr has been occured. Try again.")
            console.log(error)
        })
}
/**
 * loads the flickr pictures to the carousel of flickr to show the results as a picture with information
 * @param {JSON} flickr
 */
function drawFlickrToUI(flickr) {
    $('.carousel').carousel('pause')
    $('#flickr-carousel-inner').empty()
    //TODO: the carousel next and prev buttons does not work
    flickr.data.forEach((pic) => {
        var pic_id = pic.photo_id
        $("#flickr-carousel-inner").append('<div class="carousel-item flickr-carousel-elem" id="' + pic_id + '" lat="' + pic.latitude + '" lon="' + pic.longitude + '">'
           // +'<button type="button" onclick="changeActive() class="middle-button btn btn-primary btn-sm">jump to</button>'
            + '<img src="https://farm' + pic.farm + '.staticflickr.com/' + pic.server + '/' + pic_id + '_' + pic.secret + '_q.jpg" alt="' + pic.title + '">'
            +'</br>'
            +'<a href="' + pic.url + '" target="_blank">' + pic.title + '</a>'
            +'</div>'
           // + '<a class="flickr-link" onclick="changeActive()" >jump to</a>'

)
    });
    $(".carousel-item").first().addClass("active")
    //TODO: highlight point when the picture is active in the carousel
};

