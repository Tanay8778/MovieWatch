import { Client, Databases, ID, Query } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ])

    if (result.documents.length > 0) {
      const doc = result.documents[0];

      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
        title: movie.Title || doc.title,
        movie_id: movie.imdbID || doc.movie_id,
        poster_url: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : doc.poster_url,
      })
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        title: movie.Title || searchTerm,
        movie_id: movie.imdbID || '',
        poster_url: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '',
      })
    }
  } catch (error) {
    console.error(error);
  }
}

export const getTrendingMovies = async () => {
 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.limit(5),
    Query.orderDesc("count")
  ])

  return result.documents;
 } catch (error) {
  console.error(error);
 }
}