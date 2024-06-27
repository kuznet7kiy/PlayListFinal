const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const dbURI =
	process.env.MONGODB_URI ||
	'mongodb+srv://kuzart:AbCdEfGh@cluster0.fswk90n.mongodb.net/'

mongoose
	.connect(dbURI, { dbName: 'cluster0' })
	.then(() => {
		console.log('MongoDB connected...')
		return mongoose.connection.db.dropCollection('games')
	})
	.then(() => {
		console.log('Collection cleared')
		mongoose.disconnect()
	})
	.catch(err => {
		console.error('Error:', err)
		mongoose.disconnect()
	})
