$(document).ready(() => {
    requestTweets();
});

function requestTweets() {
    $("#btn_tweetrequest").on("click", async () => {
        var query = {
            keyword: $("#keyword_input").val(),
            geocode: "37.735997,-118.427388,100km",
            language: "",
            locale: "ja",
            result_type: "recent",
            count: "100",
            until: "",
            since_id: "",
            max_id: "",
            include_entities: false
        };

        await $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/twitterapi',
            data: query,
            dataType: 'json',
            encode: true
        }).done(function (data) {
            console.log('Success: Data from Twitter received');
        }).fail(function (xhr, status, error) {
            console.log('Error: ' + error);
        });

        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/tweetdb',
        }).done(function (data) {
            console.log('Success: Tweets from the database received');
            filterTweets(data);
        }).fail(function (xhr, status, error) {
            console.log('Error: ' + error);
        });
    });
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
            polygon.geometry.coordinates.forEach((coordinates) => {
                var poly = {
                    "type": "Polygon",
                    "coordinates": coordinates
                };

                polygons.push(poly);
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
}

//TODO: Ueberpruefe, ob Tweet im Polygon liegt
function polygonContainsTweet(polygon, tweet) {

}

function filterTweets(tweets) {
    var polygons = getPolygonsInBbox();

    var filteredtweets = [];

    polygons.forEach((polygon) => {
        tweets.forEach((tweet) => {
            if (polygonContainsTweet(polygon, tweet)) {
                filteredtweets.push(tweet);
            }
        });
    });
}

/* function processData(data) {
    $(".tweet").remove();
    var raw = data.statuses;
    var filtered = new Array();

    raw.forEach((tweet) => {
        if ((tweet.coordinates != null) || (tweet.geo != null) || (tweet.place != null)) {
            filtered.push(tweet);
        }
    });

    filtered.forEach((tweet) => {
        console.log(filtered);
        drawTweetToUI(tweet);
        var geo = tweet.geo;
        var place = tweet.place;
        var marker = null;
        if ((geo != null) && (geo != undefined)) {
            marker = L.marker(geo.coordinates);
        } else {
            if ((place != null) && (place != undefined)) {
                var bbox = place.bounding_box;
                var icon = L.AwesomeMarkers.icon({
                    markerColor: 'blue',
                });
                var coordinates = turf.flip((turf.center(bbox))).geometry.coordinates;
                marker = L.marker(coordinates, { id: tweet.id_str, icon: icon });
            }
        }
        marker.on("click", (e) => {
            var id = e.target.options.id;
            $('.carousel-item').removeClass("active");
            $('#' + id).addClass("active");
        });
    });
    $('.carousel-item').first().addClass("active");
};

function drawTweetToUI(tweet) {
    var tweet_id = tweet.id_str;
    var tweet_html = '<div class="tweet carousel-item" id="' + tweet_id + '"></div>';
    $("#tweet_carousel_inner").append(tweet_html);
    var tweet_dom = $("#" + tweet_id)[0];
    twttr.widgets.createTweet(tweet_id, tweet_dom, widget_config);
}; */