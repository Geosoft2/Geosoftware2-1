$('select').selectpicker();

requestTweets();

function requestTweets() {
    $(document).ready(() => {
        $("#twitter_form").submit((event) => {
            event.preventDefault();

            var query = {
                keyword: $("#keyword_input").val(),
                count: $("#count_select").val(),
                language: $("#language_select").val()
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
    var tweets = data.statuses;

    tweets.forEach((tweet) => {
        var tweet_id = tweet.id_str;
        var tweet_html = '<div class="tweet carousel-item" id="' + tweet_id + '"></div>';
        $("#tweet_carousel_inner").append(tweet_html);
        var tweet_dom = $("#" + tweet_id)[0];
        twttr.widgets.createTweet(tweet_id, tweet_dom, widget_config);
    });
};