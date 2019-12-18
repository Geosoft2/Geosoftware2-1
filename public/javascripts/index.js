$(document).ready(() => {
    requestTweets();
});

function requestTweets() {
    $("#btn_tweetrequest").on("click", async () => {
        var query = {
            keyword: $("#keyword_input").val(),
            geocode: "37.735997,-118.427388,100km",
            language: $("#language_select").val(),
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
            //filterTweets(data);
            test(data);
        }).fail(function (xhr, status, error) {
            console.log('Error: ' + error);
        });
    });
};

/* function getPolygonsInBbox() {
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
    //console.log(polygon, tweet);

    if (tweet.geo != null) {
        var coord = tweet.geo.coordinates;
        console.log(turf.booleanPointInPolygon(coord, polygon));
    } else {
        if (tweet.place != null) {
            //console.log(tweet.place);
        }
    }
}

function filterTweets(tweets) {
    var polygons = getPolygonsInBbox();

    var testpolygon = {
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [7.5146484375, 52.29504228453735],
                [7.84423828125, 50.708634400828224],
                [10.61279296875, 50.233151832472245],
                [13.095703125, 51.97134580885172],
                [10.349121093749998, 53.173119202640635],
                [7.5146484375, 52.29504228453735]
            ]]
        }
    };

    polygons.push(testpolygon);

    //console.log(polygons);

    var filteredtweets = [];

    polygons.forEach((polygon) => {
        tweets.forEach((t) => {
            var tweet = JSON.parse(t.tweet);
            if (polygonContainsTweet(polygon, tweet)) {
                filteredtweets.push();
            }
        });
    });
} */

function test(tweets) {
    $(".tweet").remove();
    tweets.forEach((t) => {
        var tweet = JSON.parse(t.tweet);
        drawTweetToUI(tweet);
        drawTweetToMap(tweet);
    });
    $('.carousel-item').first().addClass("active");
}

function drawTweetToUI(tweet) {
    var tweet_id = tweet.id_str;
    var tweet_html = '<div class="tweet carousel-item" id="' + tweet_id + '"></div>';
    $("#tweet_carousel_inner").append(tweet_html);
    var tweet_dom = $("#" + tweet_id)[0];
    twttr.widgets.createTweet(tweet_id, tweet_dom, widget_config);
};

function drawTweetToMap(tweet) {
}