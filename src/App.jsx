import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import MovieDetails from './components/MovieDetails.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, getWatchlistItems, updateSearchCount, removeFromWatchlist } from './appwrite.js'

const WatchlistView = ({ onBack }) => {
  const [watchlistMovies, setWatchlistMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // NEW FUNCTION: Removes the movie and instantly updates the screen
  const handleRemove = async (movieId) => {
    try {
      await removeFromWatchlist(movieId)
      // Filter the deleted movie out of the local array to instantly remove it from the screen
      setWatchlistMovies((prevMovies) => prevMovies.filter((m) => m.movieId !== movieId))
    } catch (error) {
      console.error('Failed to remove movie', error)
      alert('Failed to remove movie from watchlist.')
    }
  }

  useEffect(() => {
    const loadWatchlist = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const movies = await getWatchlistItems()
        setWatchlistMovies(movies)
      } catch (error) {
        console.error(error)
        setErrorMessage('Unable to load your watchlist right now.')
      } finally {
        setIsLoading(false)
      }
    }

    loadWatchlist()
  }, [])

  return (
    <section className="watchlist-view">
      <div className="flex items-center justify-between mb-8">
        <h2 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>Your Watchlist</h2>
        <button 
          type="button" 
          onClick={onBack}
          style={{ padding: '8px 16px', backgroundColor: '#4b5563', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          ← Back to Search
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : watchlistMovies.length === 0 ? (
        <p style={{ color: 'white' }}>Your watchlist is empty. Add movies from the home page.</p>
      ) : (
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px', padding: 0, listStyle: 'none' }}>
          {watchlistMovies.map((movie) => (
            <li key={movie.movieId || movie._id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <img 
                src={movie.posterPath && movie.posterPath !== 'N/A' ? movie.posterPath : 'https://via.placeholder.com/200x300'} 
                alt={movie.title} 
                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
              />
              <strong style={{ color: 'white', display: 'block', fontSize: '1.1rem' }}>{movie.title}</strong>
              
              {/* NEW BUTTON: Remove from Watchlist */}
              <button
                type="button"
                onClick={() => handleRemove(movie.movieId)}
                style={{
                  marginTop: 'auto', // Pushes the button to the bottom of the card
                  padding: '8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                − Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const AppHeader = ({ searchTerm, setSearchTerm, onOpenWatchlist }) => (
  <header>
    <img src="./hero.png" alt="Hero Banner" />
    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '15px', width: '100%', marginTop: '20px' }}>
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <button 
        type="button" 
        onClick={onOpenWatchlist}
        style={{
          padding: '12px 24px',
          backgroundColor: '#8b5cf6',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        📋 Open Watchlist
      </button>
    </div>
  </header>
)

const API_BASE_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [view, setView] = useState('home');
  const [globalWatchlist, setGlobalWatchlist] = useState([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`
        : `${API_BASE_URL}?s=movie&apikey=${API_KEY}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      const movies = data.Search || [];
      setMovieList(movies);

      if (query && movies.length > 0) {
        await updateSearchCount(query, movies[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  const loadGlobalWatchlist = async () => {
    try {
      const items = await getWatchlistItems();
      setGlobalWatchlist(items);
    } catch (error) {
      console.error('Failed to fetch global watchlist', error);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
    loadGlobalWatchlist();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <AppHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenWatchlist={() => setView('watchlist')}
        />

        {view === 'watchlist' ? (
          <WatchlistView onBack={() => {
            setView('home');
            // Refresh the global watchlist when coming back from the watchlist view
            // to ensure any new state changes are synced
            loadGlobalWatchlist();
          }} />
        ) : selectedMovieId ? (
          <MovieDetails movieId={selectedMovieId} onBack={() => setSelectedMovieId(null)} />
        ) : (
          <>
            {/* Replace your commented out trending section with this */}
            {trendingMovies.length > 0 && (
              <section className="trending">
                <h2>Trending Movies</h2>

                <ul>
                  {trendingMovies.map((movie, index) => (
                    <li key={movie.$id}>
                      <p>{index + 1}</p>
                      <img src={movie.poster} alt={movie.Title} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="all-movies">
              <h2>All Movies</h2>

              {isLoading ? (
                <Spinner />
              ) : errorMessage ? (
                <p className="text-red-500">{errorMessage}</p>
              ) : (
                <ul>
                  {movieList.map((movie) => {
                    const isAlreadyAdded = globalWatchlist.some(w => w.movieId === movie.imdbID);

                    return (
                      <MovieCard
                        key={movie.imdbID || movie.Title}
                        movie={movie}
                        isWatchlisted={isAlreadyAdded}
                        onSelect={() => setSelectedMovieId(movie.imdbID)}
                      />
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default App