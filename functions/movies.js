const { URL } = require('url');
const fetch = require('node-fetch');
// const movies = require('../data/movies.json');
const { query } = require('./utils/hasura');

exports.handler = async () => {
  const { movies } = await query({
    query: `
      query {
        movies {
          id
          poster
          tagline
          title
        }
      }
    `,
  });

  const api = new URL('https://www.omdbapi.com/');

  api.searchParams.set('apikey', process.env.OMDB_API_KEY);

  const promises = movies.map(movie => {
    api.searchParams.set('i', movie.id);

    return fetch(api)
      .then(response => response.json())
      .then(data => {
        const scores = data.Ratings;

        return {
          ...movie,
          scores,
        };
      })
      .catch(error => console.error(error));
  });

  const movieWithRatings = await Promise.all(promises);

  return {
    statusCode: 200,
    body: JSON.stringify(movieWithRatings),
  };
};
