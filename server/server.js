const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const routesUrls = require('./routes/routes')


dotenv.config()


app.use(express.json())
app.use(cors())

app.use('/app',routesUrls)
app.listen(4000, ()=> console.log("server is up and run"))