const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/movies/", async (request, response) => {
  const getAllMovies = `SELECT movie_name FROM movie;`;

  const allMovies = await db.all(getAllMovies);
  const moviesObjToArr = (movie) => {
    return { movieName: movie.movie_name };
  };

  response.send(allMovies.map((eachMovie) => moviesObjToArr(eachMovie)));
});

//API 2
app.post("/movies/", async (request, response) => {
  const newMovie = request.body;
  let { director_id, movie_name, lead_actor } = newMovie;

  const addMovie = `
            INSERT INTO
              movie(director_id,movie_name,lead_actor)
            VALUES 
              (
               ${director_id},
               '${movie_name}',
               '${lead_actor}'
                );
            `;

  const newMovieAdded = await db.run(addMovie);
  const movie_id = newMovieAdded.lastID;
  response.send("Movie successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieById } = request.params;

  let getMovie = `SELECT * FROM movie WHERE movie_id = ${movieById};`;

  const getMovieById = await db.get(getMovie);
  const getMovieByIdToObj = (g) => {
    return {
      movieId: g.movie_id,
      directorId: g.director_id,
      movieName: g.movie_name,
      leadActor: g.lead_actor,
    };
  };

  response.send(getMovieByIdToObj(getMovieById));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { updateMovieId } = request.params;
  const updateMovieDetails = request.body;
  const { director_id, movie_name, lead_actor } = updateMovieDetails;

  let updatingMovieById = `UPDATE
                              movie 
                            SET
                              director_id = ${director_id},
                              movie_name = '${movie_name}',
                              lead_actor = '${lead_actor}'
                            WHERE 
                              movie_id = ${updateMovieId}
                            ;`;

  await db.run(updatingMovieById);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { delMovieId } = request.params;
  const deletingMovie = `DELETE FROM movie WHERE movie_id = ${delMovieId};`;

  await db.run(deletingMovie);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getAllDirectors = `SELECT * FROM director;`;

  const directorsList = await db.all(getAllDirectors);

  const directorsObjList = (director) => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    };
  };

  response.send(directorsList.map((eachDir) => directorsObjList(eachDir)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorById } = request.params;

  const getDirMovies = `SELECT movie_name 
                          FROM movie 
                          WHERE 
                            director_id = ${directorById};`;

  const dirAllMovies = await db.all(getDirMovies);
  const dirMovieToObj = (dirMovie) => {
    return {
      movieName: dirMovie.movie_name,
    };
  };

  response.send(dirAllMovies.map((eachMovie) => dirMovieToObj(eachMovie)));
});

module.exports = app;
