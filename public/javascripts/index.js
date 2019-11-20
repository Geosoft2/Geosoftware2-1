const widget_config = {
    conversation: 'none',    // or all
    cards: 'hidden',  // or visible
    linkColor: '#cc0000', // default is blue
    theme: 'dark'    // or dark
};

requestTweets();

function requestTweets() {
    $(document).ready(() => {
        $("#twitter_form").submit((event) => {
            event.preventDefault();

            var query = {
                keyword: $("#keyword_input").val()
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
    $("twitter-widget").remove();
    var tweet_id = data.statuses[0].id_str;

    $('.tweet').attr("id", tweet_id);

    var tweets = $(".tweet");

    $(tweets).each(function (index, tweet) {

        var id = $(this).attr('id');

        twttr.widgets.createTweet(id, tweet, widget_config);
    });
};