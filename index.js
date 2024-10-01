import express from 'express'
import ejs from 'ejs'
import axios from 'axios'
import bodyParser from 'body-parser'
import pg from 'pg'
import dotenv from 'dotenv';
dotenv.config();

const port = 3500
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
const apiKey = process.env.apikey;

const db = new pg.Client({
	user: 'postgres',
	host: 'localhost',
	database: 'Task',
	password: 'Krusty685',
	port: 5432
})
db.connect()

function Todaydate() {
	const today = new Date();
	const day = today.getDate();
	const month = today.getMonth() + 1;
	const year = today.getFullYear();

	const dateOnly = `${day}/${month}/${year}`;
	return dateOnly

}

app.get('/', async (req, res) => {
	if (temp.length == 0) {
		res.render('index.ejs')

	} else {
		res.render('index.ejs', { data: temp })
	}
})
var temp = []
app.get('/collection', async (req, res) => {
	try {
		const result = await db.query("SELECT * FROM book_collection")
		if (result.rows.length > 0) {
			res.render('view.ejs', { data: result.rows })
		} else {
			res.send("<h1>No Books Added</h1>")
		}
	} catch (error) {
		console.log("error")

	}

})
app.get('/make', async (req, res) => {
	try {
		const id = req.query.Book_id
		const date = Todaydate()
		const recheck = await db.query("SELECT id,notes FROM notes WHERE id=$1", [id])
		if ((recheck.rows).length == 1) {
			res.render('view.ejs', { msg: recheck.rows[0] })
		} else {
			const result = await db.query('SELECT id,title,author FROM book_collection WHERE id=$1', [id])
			res.render('notes.ejs', {
				data: result.rows[0],
				date: date
			})
		}
	} catch (error) {
		console.log(error.message)
	}
})

app.post('/edit', async (req, res) => {
	const id = req.body.notes_id
	const result = await db.query("SELECT book_collection.id,title,author,notes,date FROM book_collection JOIN notes ON book_collection.id=notes.id WHERE book_collection.id=$1", [id])
	res.render('notes.ejs', { edit_data: result.rows[0] })

})

app.post('/save', async (req, res) => {
	const id = req.body.book_id
	const notes = req.body.notes
	const date = req.body.date
	const check = await db.query("SELECT notes FROM notes WHERE id=$1", [id])
	if (check.rows.length == 1) {
		db.query("UPDATE notes SET notes=$1 WHERE id=$2", [notes, id])
		console.log("notes updated!")
		res.redirect('/view?Book_id=' + id)
	} else {
		try {

			db.query("INSERT INTO notes(id,notes,date) VALUES($1,$2,$3)", [id, notes, date])
			console.log("Notes Added")
			res.redirect('/collection')
		} catch (error) {
			console.log({ error: "Already added" })
		}
	}
})
app.get('/view', async (req, res) => {
	try {

		const id = req.query.Book_id
		const result = await db.query("SELECT book_collection.id,title,img,author,notes,date FROM book_collection JOIN notes ON book_collection.id=notes.id WHERE book_collection.id=$1", [id])
		if (result.rows.length == 1) {
			res.render('notes_view.ejs', { data: result.rows[0] })
		} else {
			res.redirect('/collection')
		}
	} catch (error) {
		console.log(error.message)
	}
})
app.post('/fetch', async (req, res) => {
	try {
		const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=' + req.body.book + '&key=' + apiKey)
		const result = response.data
		temp = [...result.items]
		res.redirect('/')
	}
	catch (error) {
		res.render('index.ejs', { error: error.message })
	}

})
app.post('/add', async (req, res) => {
	try {
		const title = req.body.title
		const author = req.body.author
		const img = req.body.image
		db.query(`INSERT INTO book_collection(title,author,img) VALUES($1,$2,$3)`, [title, author, img])
		console.log("Book Added")
		res.redirect('/')
	}
	catch (error) {
		console.log("Error: " + error.message)
	}
})

app.post('/delete', (req, res) => {
	const id = req.body.notes_id
	db.query("DELETE FROM notes WHERE id=$1", [id])
	res.redirect('/collection')
	console.log("notes Deleted")
})

app.listen(port, () => {
	console.log(`Server is running on port: http://localhost:${port}`)
})

