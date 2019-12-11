$(document).ready(() => {
    document.cookie = "geocode=";
    $('select').selectpicker();
    requestTweets();
});

function requestTweets() {
    $(document).ready(() => {
        $("#twitter_form").submit((event) => {
            event.preventDefault();

            var query = {
                keyword: $("#keyword_input").val(),
                count: $("#count_select").val(),
                language: $("#language_select").val(),
                geocode: getCookie("geocode")
            };

            $.ajax({
                type: 'POST',
                url: 'http://localhost:3000/api',
                data: query,
                dataType: 'json',
                encode: true
            }).done(function (data) {
                processData(data);
                console.log('Success: Data from Twitter received');
            }).fail(function (xhr, status, error) {
                console.log('Error: ' + error);
            });
        });
    });
};

function processData(data) {
    $(".tweet").remove();
    var raw = data.statuses;
    var filtered = new Array();

    raw.forEach((tweet) => {
        if ((tweet.coordinates != null) || (tweet.geo != null) || (tweet.place != null)) {
            filtered.push(tweet);
        }
    });

    filtered.forEach((tweet) => {
        console.log(tweet);
        drawTweetToUI(tweet);
        var geo = tweet.geo;
        var place = tweet.place;
        if ((geo != null) && (geo != undefined)) {
            L.marker(geo.coordinates).addTo(map);
        } else {
            if ((place != null) && (place != undefined)) {
                var bbox = place.bounding_box;
                var coordinates = turf.flip((turf.center(bbox))).geometry.coordinates;
                L.marker(coordinates, { id: tweet.id_str })
                    .addTo(map)
                    .on("click", (e) => {
                        var id = e.target.options.id;
                        console.log(id);
                    });
            }
        }
    });
};

function drawTweetToUI(tweet) {
    var tweet_id = tweet.id_str;
    var tweet_html = '<div class="tweet carousel-item" id="' + tweet_id + '"></div>';
    $("#tweet_carousel_inner").append(tweet_html);
    var tweet_dom = $("#" + tweet_id)[0];
    twttr.widgets.createTweet(tweet_id, tweet_dom, widget_config);
};

