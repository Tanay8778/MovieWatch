const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    appwriteUserId: { type: String, required: true, unique: true },
    movies: [{
        movieId: { type: String, required: true },
        title: { type: String, required: true },
        posterPath: { type: String }
    }]
});

module.exports = mongoose.model('Watchlist', watchlistSchema);