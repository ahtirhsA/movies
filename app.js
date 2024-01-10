const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
const dbpath = path.join(__dirname, 'moviesData.db')
let db = null
app.use(express.json())

const connectionWithServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`The Error Message is ${e}`)
    process.exit(1)
  }
}
connectionWithServer()

app.get('/movies/', async (request, response) => {
  const x = `
    SELECT movie_name FROM movie
    `
  const res = await db.all(x)
  response.send(res.map(i => ({movieName: i.movie_name})))
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const newRow = `
        INSERT INTO movie(
           director_id, movie_name, lead_actor
        )
        VALUES(${directorId},'${movieName}','${leadActor}');
        `
  const res = await db.run(newRow)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const oneMovie = `
       SELECT * FROM movie
       WHERE movie_id=${movieId};`
  const resMovie = await db.get(oneMovie)
  response.send(resMovie)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const bdy = request.body
  const {directorId, movieName, leadActor} = bdy
  const updTable = `
   UPDATE movie SET 
     director_id=${directorId},
     movie_name='${movieName}',
     lead_actor='${leadActor}'
   WHERE movie_id=${movieId};
  `
  const resUpdTable = await db.run(updTable)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const rowDeleted = `
   DELETE FROM movie
   WHERE movie_id=${movieId}
  `
  const res = await db.run(rowDeleted)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const movieDirectors = `
   SELECT * FROM director;
  `
  const resAllRows = await db.all(movieDirectors)
  response.send(resAllRows)
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const singleDirector = `
   SELECT * FROM director JOIN movie
   ON director.director_id=movie.director_id
   WHERE director.director_id=${directorId};`
  const resArr = await db.all(singleDirector)
  response.send(resArr.map(i => ({movieName: i.movie_name})))
})

module.exports = app
