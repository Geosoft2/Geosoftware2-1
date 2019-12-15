const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    tweet: String
});

const tweetModel = mongoose.model("TweetModel", tweetSchema);

module.exports = { tweetModel };