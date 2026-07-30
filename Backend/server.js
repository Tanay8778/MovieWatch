const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Watchlist = require('./models/watchlist'); 

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using IPv4
mongoose.connect(process.env.MONGO_URI, { family: 4 })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Simplified user ID middleware for smooth local testing
const getUserId = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token && token !== 'undefined' && token !== 'null') {
            try {
                // 1. Extract the payload (the middle part of the JWT)
                const base64Payload = token.split('.')[1];
                
                // 2. Decode it from base64 into a readable JSON string
                const payloadBuffer = Buffer.from(base64Payload, 'base64');
                const decoded = JSON.parse(payloadBuffer.toString('utf-8'));
                
                // 3. Return the persistent user ID embedded inside the Appwrite token
                if (decoded.userId) {
                    return decoded.userId; 
                }
            } catch (error) {
                console.error('Failed to decode JWT payload:', error.message);
            }
            
            return token; // Fallback just in case
        }
    }
    return req.headers['x-dev-user'] || 'demo-user';
};

// ==========================================
// POST: Add a movie to the watchlist
// ==========================================
app.post('/api/watchlist', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { movieId, title, posterPath } = req.body;

        if (!movieId || !title) {
            return res.status(400).json({ error: 'Movie ID and Title are required' });
        }

        let watchlist = await Watchlist.findOne({ appwriteUserId: userId });

        if (!watchlist) {
            watchlist = new Watchlist({
                appwriteUserId: userId,
                movies: []
            });
        }

        const movieExists = watchlist.movies.find(m => m.movieId === String(movieId));
        
        if (!movieExists) {
            watchlist.movies.push({ 
                movieId: String(movieId), 
                title, 
                posterPath: posterPath || '' 
            });
            await watchlist.save();
        }

        return res.status(200).json({ message: 'Movie added successfully', watchlist });

    } catch (error) {
        console.error('CRITICAL BACKEND ERROR (POST):', error);
        return res.status(500).json({ error: error.message });
    }
});

// ==========================================
// GET: Fetch the user's watchlist
// ==========================================
app.get('/api/watchlist', async (req, res) => {
    try {
        const userId = getUserId(req);
        const watchlist = await Watchlist.findOne({ appwriteUserId: userId });
        
        return res.status(200).json(watchlist ? watchlist.movies : []);

    } catch (error) {
        console.error('CRITICAL BACKEND ERROR (GET):', error);
        return res.status(500).json({ error: error.message });
    }
});

app.delete('/api/watchlist/:movieId', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { movieId } = req.params;

        const watchlist = await Watchlist.findOne({ appwriteUserId: userId });

        if (watchlist) {
            // Filter out the movie with the matching ID
            watchlist.movies = watchlist.movies.filter(m => m.movieId !== String(movieId));
            await watchlist.save();
        }

        return res.status(200).json({ message: 'Movie removed successfully', watchlist });

    } catch (error) {
        console.error('CRITICAL BACKEND ERROR (DELETE):', error);
        return res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));