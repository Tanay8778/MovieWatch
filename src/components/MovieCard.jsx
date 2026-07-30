import { useState, useEffect } from 'react'
import { handleAddToWatchlist, removeFromWatchlist } from '../appwrite.js'

const MovieCard = ({ movie, onSelect, isWatchlisted }) => {
  const { Title, Poster, Year, Type } = movie
  const [liked, setLiked] = useState(isWatchlisted || false)
  const [isSaving, setIsSaving] = useState(false)

  // Keep button state in sync if the database fetch finishes after the card renders
  useEffect(() => {
    setLiked(isWatchlisted)
  }, [isWatchlisted])

  const posterUrl = Poster && Poster !== 'N/A' ? Poster : '/no-movie.png'
  const year = Year && Year !== 'N/A' ? Year : 'N/A'
  const type = Type && Type !== 'N/A' ? Type : 'movie'
  
  // Safely extract the ID regardless of which API format we are using
  const movieId = movie?.id ?? movie?.imdbID ?? movie?.movieId ?? ''

  const handleToggleWatchlist = async (e) => {
    e.stopPropagation(); 
    if (isSaving) return; // Prevent spam clicking

    setIsSaving(true)
    try {
      if (liked) {
        // If it's already liked, remove it
        await removeFromWatchlist(movieId)
        setLiked(false)
      } else {
        // If it's not liked, add it
        await handleAddToWatchlist(movie)
        setLiked(true)
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error)
      alert('Failed to update watchlist. Please make sure you are logged in and the server is running.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="movie-card">
      <button type="button" className="poster-button" onClick={onSelect} style={{ width: '100%', cursor: 'pointer', border: 'none', background: 'transparent' }}>
        <img src={posterUrl} alt={Title} />
      </button>

      <div className="mt-4">
        <h3>{Title}</h3>

        <div className="content">
          <span>•</span>
          <p className="lang">{type}</p>

          <span>•</span>
          <p className="year">{year}</p>
        </div>

        <button
          type="button"
          onClick={handleToggleWatchlist}
          disabled={isSaving}
          style={{
            marginTop: '15px',
            width: '100%',
            padding: '10px',
            backgroundColor: liked ? '#ef4444' : '#3b82f6', // Red for remove, Blue for add
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            zIndex: 10,
            position: 'relative'
          }}
        >
          {isSaving ? 'Updating...' : liked ? '− Remove' : '+ Add to Watchlist'}
        </button>
      </div>
    </div>
  )
}

export default MovieCard