import { Account, Client, Databases, ID, Query } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(PROJECT_ID)

const account = new Account(client)
const database = new Databases(client)

export { account, client, database }

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ])

    if (result.documents.length > 0) {
      const doc = result.documents[0]

      // FIX 1: Use updateDocument instead of updateRow
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
        // FIX 2: Match the exact column names from your Appwrite console
        Title: movie.Title || doc.Title, 
        poster: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : doc.poster,
      })
    } else {
      // FIX 1: Use createDocument instead of createRow
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        // FIX 2: Match the exact column names from your Appwrite console
        Title: movie.Title || searchTerm,
        poster: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '',
      })
    }
  } catch (error) {
    console.error('Error updating search count:', error)
  }
}

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc('count'),
    ])

    return result.documents
  } catch (error) {
    console.error(error)
    return []
  }
}

export const handleAddToWatchlist = async (movie) => {
  const movieId = movie?.id ?? movie?.imdbID ?? movie?.movieId ?? ''
  const title = movie?.title ?? movie?.Title ?? 'Untitled movie'
  const posterPath = movie?.poster_path ?? movie?.Poster ?? ''

  if (!movieId) {
    throw new Error('Movie ID is required to add it to the watchlist.')
  }

  try {
    let jwt = null

    try {
      const sessionToken = await account.createJWT()
      jwt = sessionToken?.jwt
    } catch {
      jwt = null
    }

    const headers = {
      'Content-Type': 'application/json',
    }

    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`
    } else {
      headers['x-dev-user'] = 'demo-user'
    }

    // POST request to your Node.js Backend
    const response = await fetch('http://localhost:5000/api/watchlist', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        movieId,
        title,
        posterPath,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add movie to the watchlist.')
    }

    return data
  } catch (error) {
    console.error('Unable to add movie to watchlist.', error)
    throw error
  }
}

// Fetch the watchlist from your Node.js Backend
export const getWatchlistItems = async () => {
  try {
    let jwt = null;
    
    try {
      const sessionToken = await account.createJWT();
      jwt = sessionToken?.jwt;
    } catch {
      jwt = null;
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    } else {
      headers['x-dev-user'] = 'demo-user';
    }

    // GET request to your Node.js Backend
    const response = await fetch('http://localhost:5000/api/watchlist', {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch watchlist from Node backend');
    }
    
    const data = await response.json();
    // FIX: Correctly process the response whether it's wrapped in an object or a direct array
    return Array.isArray(data) ? data : (data.movies || []);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
};

export const removeFromWatchlist = async (movieId) => {
  try {
    let jwt = null;
    
    try {
      const sessionToken = await account.createJWT();
      jwt = sessionToken?.jwt;
    } catch {
      jwt = null;
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    } else {
      headers['x-dev-user'] = 'demo-user';
    }

    const response = await fetch(`http://localhost:5000/api/watchlist/${movieId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to remove from watchlist');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};