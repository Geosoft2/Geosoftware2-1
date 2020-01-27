$(document).ready(() => {
    requestTweets();
});
var url = window.location.href;
var arr = url.split("/");
var host = arr[0] + "//" + arr[2];
//TODO: das ist ein test TODO
function requestTweets() {
    $("#btn_tweetrequest").on("click", async () => {

        //Search API
        var query = twitter_default;
        query.q = $("#keyword_input").val();
        query.lang = $("#language_select").val();

        await $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/api/v1/twitter',
            data: query,
            dataType: 'json',
            encode: true
        }).done(function (data) {
            console.log('Success: Data from Twitter received');
            console.log(data);
            //filterTweets(data);
        }).fail(function (xhr, status, error) {
            console.log('Error: ' + error);
        });
    });
};

function filterTweets(tweets) {
    var polygons = getPolygonsInBbox();

    var filteredtweets = [];

    tweets.forEach((t, index) => {
        tweets[index] = toJSON(t);

        /* var inside = false;
        var i = 0;
        //TODO: Laufzeit problematisch
        while ((!inside) && (i < polygons.length)) {
            if (tweetInPolygon(tweet, polygons[i])) {
                filteredtweets.push(tweet);
                inside = true;
            }
        } */

        t = tweets[index];

        if (t.geo != null) {
            filteredtweets.push(t);
        }
    });

    drawTweetsToMap(filteredtweets);
    drawTweetsToUI(filteredtweets);
};

function getPolygonsInBbox() {
    var bboxsouthWest_lat = parseFloat(getCookie("bboxsouthWest_lat"));
    var bboxsouthWest_lng = parseFloat(getCookie("bboxsouthWest_lng"));
    var bboxnorthEast_lat = parseFloat(getCookie("bboxnorthEast_lat"));
    var bboxnorthEast_lng = parseFloat(getCookie("bboxnorthEast_lng"));

    var bboxsouthWest = [bboxsouthWest_lng, bboxsouthWest_lat];
    var bboxnorthWest = [bboxsouthWest_lng, bboxnorthEast_lat];
    var bboxnorthEast = [bboxnorthEast_lng, bboxnorthEast_lat];
    var bboxsouthEast = [bboxnorthEast_lng, bboxsouthWest_lat];

    var bbox = {
        "type": "Polygon",
        "coordinates": [[
            bboxsouthWest, bboxnorthWest, bboxnorthEast, bboxsouthEast, bboxsouthWest
        ]]
    };

    var dwd = output.features;
    var polygons = [];

    dwd.forEach((polygon) => {
        if (polygon.geometry.type == "MultiPolygon") {
            polygon.geometry.coordinates.forEach((c) => {
                c.forEach((coordinates) => {
                    var poly = {
                        "type": "Polygon",
                        "coordinates": [coordinates]
                    };

                    polygons.push(poly);
                });
            });
        } else {
            if (polygon.geometry.type == "Polygon") {
                polygons.push(polygon.geometry);
            }
        }
    });

    var polygonswithinbbox = [];

    polygons.forEach((p) => {
        if (turf.booleanContains(bbox, p)) {
            polygonswithinbbox.push(p);
        }
    });

    return polygonswithinbbox;
};

//TODO: Ueberpruefe, ob Tweet im Polygon liegt
function tweetInPolygon(tweet, polygon) {
    if (tweet.geo != null) {
        return d3.geoContains(polygon, tweet.geo);
    } else {
        if (tweet.place != null) {
            //console.log(tweet.place);
        }
    }
};

function drawTweetsToUI(tweets) {
    var first = tweets[0].id_str;
    tweets.forEach((tweet) => {
        console.log(tweet);
        var tweet_id = tweet.id_str;
        var tweet_html = '<div class="tweet carousel-item" id="' + tweet_id + '"></div>';
        $("#tweet_carousel_inner").append(tweet_html);
        var tweet_dom = $("#" + tweet_id)[0];
        twttr.widgets.createTweet(tweet_id, tweet_dom, widget_config);
    });

    $(".carousel-item").first().addClass("active");
};

function drawTweetsToMap(tweets) {
    var defaultIcon = L.ExtraMarkers.icon({
        markerColor: 'cyan',
        prefix: 'fab',
        icon: 'fa-twitter',
        iconColor: 'white'
    });

    var selectedIcon = L.ExtraMarkers.icon({
        markerColor: 'green-light',
        prefix: 'fab',
        icon: 'fa-twitter',
        iconColor: 'white'
    });

    var markergroup = L.featureGroup()
        .addEventListener("click", (e) => {
            markergroup.eachLayer((marker) => {
                marker.setIcon(defaultIcon);
            });

            e.layer.setIcon(selectedIcon);
        })
        .addTo(map);

    tweets.forEach((t) => {
        if (t.geo != null) {
            var marker = L.marker(t.geo.coordinates, { icon: defaultIcon, alt: "marker" })

            markergroup.addLayer(marker);
        }
    });
};

function toJSON(tweet) {
    return {
        id: JSON.parse(tweet.id),
        geo: JSON.parse(tweet.geo),
        place: JSON.parse(tweet.place)
    };
}


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
function flickrGetPublic(reload){
    document.cookie = "flickr_groupID=" + "public"
    giveLoadMessage("Flickr is loading", "flickr")
    axios.get('/api/v1/flickr?bbox="5.98865807458, 47.3024876979, 15.0169958839, 54.983104153"&reload="'+reload+'"')
    .then(function (response) {
    drawFlickrToMap(response)
    drawFlickrToUI(response)
    //drawFlickrToMap(response)
    //$(document).ready(() => {
    $(".flickr").delay(0).fadeOut(0) 
    //});
    giveSuccessMessage("Flickr photos have successfully been loaded.")
    console.log("res", response)
  })
  .catch(function (error) {
    $(".flickr").delay(0).fadeOut(0)
    giveErrorMessage("An error with Flickr has been occured. Try again.")
    console.log(error)
  })
  .finally(function () {
    // always executed
  });
}



/**
 *function to get all Flickr photos in the Salus Solution Group and show them on the map
 *@param {boolean} reload should the system reload the FlickrAPI or not {true, false}
 */
function flickrGetGroup(reload){
    document.cookie = "flickr_groupID=" + "14643952@N25";
    giveLoadMessage("Flickr is loading", "flickr");
    axios.get('/api/v1/flickr?group_id=14643952@N25&bbox="5.98865807458, 47.3024876979, 15.0169958839, 54.983104153"&reload="'+reload+'"')
    .then(function (response) {
        drawFlickrToMap(response)
        drawFlickrToUI(response)
        //drawFlickrToMap(response)
        //$(document).ready(() => {
        $(".flickr").delay(0).fadeOut(0) 
        //});
        giveSuccessMessage("Flickr photos have successfully been loaded.")
        console.log("res", response)
      })
      .catch(function (error) {
        $(".flickr").delay(0).fadeOut(0)
        giveErrorMessage("An error with Flickr connection has been occured. Try again later.")
        console.log(error)
      })
      .finally(function () {
        // always executed
      });
    }

/**
 * 
 * @param {JSON} flickr 
 */
function drawFlickrToUI(flickr) {
    $('.carousel').carousel('pause')
    flickr.data.forEach((pic) => {
        var pic_id = pic.photo_id
        
        //var pic_html = '<div class="flickr carousel-item" id="' + pic_id + '"><a href='+pic.url +'>Hallo Welt dies ist ein Link zum Bild</a></div>';
        //$("#flickr_carousel_inner").append(pic_html);
        $("#flickr-carousel-inner").append('<div class="carousel-item" id="' + pic_id + '" lat="'+pic.latitude+'" lon="'+pic.longitude+'"><a href="'+pic.url +'" target="_blank">'+pic.title+'</a></div>')
        //var tweet_dom = $("#" + pic_id)[0];
        //twttr.widgets.createTweet(tweet_id, tweet_dom, widget_config);
    });

    $(".carousel-item").first().addClass("active")
    var idFirst = $(".carousel-item").first()[0].id
    console.log("id", idFirst)
    //TODO: auf der karte highlighten mit der ID
};

/**
 * @description this function draws the given Flickr pictures to the map
 * @param {JSON} flickrpic 
 */
function drawFlickrToMap(flickrpic) {
    console.log('flickrpic:', flickrpic);
    
    var flickrIcon = L.ExtraMarkers.icon({
        markerColor: 'black',
        prefix: 'fab',
        icon: 'fa-flickr',
        iconColor: 'white'
    });

    var flickrselectedIcon = L.ExtraMarkers.icon({
        markerColor: 'yellow',
        prefix: 'fab',
        icon: 'fa-flickr',
        iconColor: 'white'
    });
   var flickrmarkergroup = L.featureGroup()
   .addEventListener("click", (e) => {
       flickrmarkergroup.eachLayer((marker) => {
           marker.setIcon(flickrIcon)
       });
       e.layer.setIcon(flickrselectedIcon)
       var id =  e.layer.options.myCustomId
       $(".active").removeClass("active")
       $("#"+ id).addClass("active")
       
   })
   .addTo(map)

   flickrpic.data.forEach((t) => {
        if (t.latitude != null && t.longitude) {
       var marker = L.marker([t.latitude,t.longitude], { icon: flickrIcon, alt: "marker", myCustomId: t.photo_id})
                    .bindPopup(""+t.title+t.user_name + t.latitude + ' '+ t.longitude)
        //marker.id = t.photo_id

       flickrmarkergroup.addLayer(marker)
   }
});

};

