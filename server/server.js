const { createServer } = require('http')
const http = require('http')
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = express()
const httpServer = http.createServer(app)

const PORT = 3000
const hostName = '127.0.0.1'

dotenv.config()
app.use(express.static(path.join(__dirname, '../client/')))

// start page
app.get('/', (req, res) => {
	res.sendFile(__dirname + '../client/index.html')
})
// connection to MongoDB
const dbURI = process.env.MONGODB_URI

if (!dbURI) {
	console.error('MongoDB URI not defined')
	process.exit(1)
}

mongoose
	.connect(dbURI)
	.then(() => console.log('MongoDB connected...'))
	.catch(err => console.log(err))

const gameSchema = new mongoose.Schema({
	gameTitle: String,
	genres: String,
	price: Number,
	service: String,
	publisher: String,
	isDone: { type: Boolean, default: false },
})
const Game = mongoose.model('Game', gameSchema)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//routes
app.get('/api/games', async (req, res) => {
	try {
		const games = await Game.find()
		res.json(games)
	} catch (err) {
		res.status(500).send(err)
	}
})
app.patch('/api/games/:id', async (req, res) => {
	const { id } = req.params
	const { isDone } = req.body
	try {
		const game = await Game.findByIdAndUpdate(id, { isDone }, { new: true })
		res.json(game)
	} catch (err) {
		console.error('Failed to update game', err)
		res.status(500).send('Failed to update game')
	}
})
app.post('/api/games', async (req, res) => {
	const newGame = new Game(req.body)
	try {
		const game = await newGame.save()
		res.json(game)
	} catch (err) {
		res.status(500).send(err)
	}
})

//
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
