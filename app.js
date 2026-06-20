require('dotenv').config()

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')


const connectDB = require('./db/db')
const authRouter = require('./routes/auth')
const roomRouter = require('./routes/room')
const transRouter = require('./routes/transaction')

const errorHandler = require('./meddlewares/error-handler')


//middlewares
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/auth',authRouter)
app.use('/api/v1/room',roomRouter)
app.use('/api/v1/transaction',transRouter)

app.use(errorHandler)

const port = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`the server listening at port ${port}.......`);
        })
    } catch (error) {
        console.log(error)
    }
}

start()