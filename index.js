import express from 'express'
import ejs from 'ejs'
import axios from 'axios'
import bodyParser from 'body-parser'
import pg from 'pg'
const port = 3500
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
require('dotenv').config();

const apiKey = process.env.API_KEY;


const db = new pg.Client({
	user: 'postgres',
	host: 'localhost',
	database: 'Task',
	password: 'Krusty685',
	port: 5432
})
db.connect()
app.get('/', async (req, res) => {
	res.render('index.ejs')
})

app.post('/fetch', async (req, res) => {
	try {
		const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=' + req.body.book + '&key=' + apiKey)
		const result = response.data

		res.render('index.ejs', { data: result.items })
	}
	catch (error) {
		res.render('index.ejs',{error:error.message})
	}

})

app.listen(port, (req, res) => {
	console.log(`Server is running on port: http://localhost:${port}`)
})

