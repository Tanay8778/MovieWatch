import React, { useEffect, useState } from 'react';
import { getWatchlist } from '../appwrite';

const Watchlist = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            const data = await getWatchlist();
            setMovies(data);
            setLoading(false);
        };
        fetchMovies();
    }, []);

    if (loading) return <h2 style={{color: 'white', padding: '2rem'}}>Loading watchlist...</h2>;

    return (
        <div style={{ padding: '2rem', color: 'white' }}>
            <h2>My Watchlist</h2>
            {movies.length === 0 ? (
                <p>Your watchlist is empty.</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {movies.map((movie) => (
                        <div key={movie.movieId} style={{ width: '200px' }}>
                            <img 
                                src={movie.posterPath || 'https://via.placeholder.com/200x300'} 
                                alt={movie.title} 
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                            <h4>{movie.title}</h4>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist;