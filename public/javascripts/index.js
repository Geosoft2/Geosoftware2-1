$(document).ready(() => {
    //document.cookie = "geocode="; 
    $('select').selectpicker();
    requestTweets();
});

function requestTweets() {
    $(document).ready(() => {
        $("#twitter_form").submit((event) => {
            event.preventDefault();

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

            $.ajax({
                type: 'POST',
                url: 'http://localhost:3000/twitterapi',
                data: query,
                dataType: 'json',
                encode: true
            }).done(function (data) {
                processTweets(data);
                console.log('Success: Data from Twitter received');
            }).fail(function (xhr, status, error) {
                console.log('Error: ' + error);
            });
        });
    });
};

function drawTweetsToMap(bounds) {

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