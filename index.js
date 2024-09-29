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
app.get('/', async (req, res) => {
	if(temp.length==0){
		res.render('index.ejs')
	
}else{
	res.render('index.ejs',{data:temp})
}
})
var temp=[]
app.get('/collection',async(req,res)=>{
	try{
	const result=await db.query("SELECT * FROM book_collection")
	if(result.rows.length>0){
res.render('view.ejs',{data:result.rows})
}else{
res.send("<h1>No Books Added</h1>")
}
	}catch(error){
		console.log("error")
		//res.render('view.ejs',{error:error.message})
	}

})
app.post('/fetch', async (req, res) => {
	try {
		const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=' + req.body.book + '&key=' + apiKey)
		const result = response.data
temp=[...result.items]
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
app.listen(port, (req, res) => {
	console.log(`Server is running on port: http://localhost:${port}`)
})

