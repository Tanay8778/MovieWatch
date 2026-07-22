import { useState } from 'react'

const MovieCard = ({ movie: { Title, Poster, Year, Type }, onSelect }) => {
  const [liked, setLiked] = useState(false)

  const posterUrl = Poster && Poster !== 'N/A' ? Poster : '/no-movie.png'
  const year = Year && Year !== 'N/A' ? Year : 'N/A'
  const type = Type && Type !== 'N/A' ? Type : 'movie'

  return (
    <div className="movie-card">
      <button type="button" className="poster-button" onClick={onSelect}>
        <img src={posterUrl} alt={Title} />
      </button>

      <div className="mt-4">
        <h3>{Title}</h3>

        <div className="content">
          <button
            type="button"
            className={`heart-button ${liked ? 'liked' : ''}`}
            onClick={() => setLiked((prev) => !prev)}
            aria-label={liked ? 'Unlike movie' : 'Like movie'}
          >
            ♥
          </button>

          <span>•</span>
          <p className="lang">{type}</p>

          <span>•</span>
          <p className="year">{year}</p>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
