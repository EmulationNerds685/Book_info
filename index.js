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

function Todaydate(){
	const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;
const year = today.getFullYear();

const dateOnly = `${day}/${month}/${year}`; 
return dateOnly

}

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
		
	}

})
app.get('/make', async (req,res)=>{
	try{
const id=req.query.Book_id
const date=Todaydate()

const result=await db.query('SELECT id,title,author FROM book_collection WHERE id=$1',[id])
res.render('notes.ejs',{data:result.rows[0],
	date:date
})

}catch(error){
	console.log(error.message)
	}
})

app.post('/edit',(req,res)=>{
	console.log(req.body)
})

app.post('/save',(req,res)=>{
	try{
	const id=req.body.book_id
	const notes=req.body.notes
	const date=req.body.date
	db.query("INSERT INTO notes(id,notes,date) VALUES($1,$2,$3)",[id,notes,date])
	console.log("Notes Added")
	res.redirect('/collection')
	}catch(error){
console.log({error:"Already added"})
	}
})
app.get('/view',async(req,res)=>{
	try{
const id=req.query.Book_id
const result= await db.query("SELECT title,img,author,notes,date FROM book_collection JOIN notes ON book_collection.id=notes.id WHERE book_collection.id=$1",[id])	
res.render('notes_view.ejs',{data:result.rows[0]})
	}catch(error){
	console.log(error.message)
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

