import { useEffect, useState } from 'react'

const API_BASE_URL = 'https://www.omdbapi.com/'
const API_KEY = import.meta.env.VITE_OMDB_API_KEY

const MovieDetails = ({ movieId, onBack }) => {
  const [movie, setMovie] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    const fetchMovieDetails = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await fetch(`${API_BASE_URL}?i=${encodeURIComponent(movieId)}&apikey=${API_KEY}&plot=full`)

        if (!response.ok) {
          throw new Error('Failed to fetch movie details')
        }

        const data = await response.json()

        if (!ignore) {
          if (data.Response === 'False') {
            setErrorMessage(data.Error || 'Failed to fetch movie details')
            setMovie(null)
          } else {
            setMovie(data)
          }
        }
      } catch (error) {
        console.error(`Error fetching movie details: ${error}`)
        if (!ignore) {
          setErrorMessage('Unable to load movie details right now.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchMovieDetails()

    return () => {
      ignore = true
    }
  }, [movieId])

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center rounded-3xl bg-dark-100/80 p-8 text-white">
        <p className="text-lg">Loading movie details...</p>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="mx-auto max-w-6xl rounded-3xl bg-dark-100/80 p-8 text-white">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-full border border-light-100/20 px-4 py-2 text-sm text-light-100 transition hover:border-[#AB8BFF] hover:text-white"
        >
          ← Back to movies
        </button>
        <p className="text-red-400">{errorMessage}</p>
      </section>
    )
  }

  if (!movie) {
    return null
  }

  const posterUrl = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '/no-movie.png'

  return (
    <section className="mx-auto max-w-6xl rounded-3xl bg-dark-100/80 p-6 text-white shadow-2xl shadow-black/30 sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 rounded-full border border-light-100/20 px-4 py-2 text-sm text-light-100 transition hover:border-[#AB8BFF] hover:text-white"
      >
        ← Back to movies
      </button>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <img
          src={posterUrl}
          alt={movie.Title}
          className="h-full w-full rounded-2xl object-cover shadow-lg"
        />

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold">{movie.Title}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-light-200">
              {movie.Year} • {movie.Runtime} • {movie.Genre}
            </p>
          </div>

          <div className="rounded-2xl bg-black/20 p-4">
            <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Plot</h3>
            <p className="leading-7 text-gray-200">{movie.Plot || 'No plot summary available.'}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Cast</h3>
              <p className="text-sm leading-7 text-gray-200">{movie.Actors || 'N/A'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Director</h3>
              <p className="text-sm leading-7 text-gray-200">{movie.Director || 'N/A'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Writer</h3>
              <p className="text-sm leading-7 text-gray-200">{movie.Writer || 'N/A'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Language</h3>
              <p className="text-sm leading-7 text-gray-200">{movie.Language || 'N/A'}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Country</h3>
              <p className="text-sm leading-7 text-gray-200">{movie.Country || 'N/A'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Awards</h3>
              <p className="text-sm leading-7 text-gray-200">{movie.Awards || 'N/A'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Box Office</h3>
              <p className="text-sm leading-7 text-gray-200">{movie.BoxOffice || 'N/A'}</p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-[#D6C7FF]">Ratings</h3>
              <p className="text-sm leading-7 text-gray-200">
                {movie.Ratings && movie.Ratings.length > 0
                  ? movie.Ratings.map((rating) => `${rating.Source}: ${rating.Value}`).join(' • ')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MovieDetails
