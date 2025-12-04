require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const cors = require('cors')
const app = express()
app.use(cors({
    origin: 'http://localhost:3000', //frontend origin
    credentials: true //allow cookies to be sent
}))
require('./Config/passport_config') 

app.use(express.json())

//session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } //1 day
}))

//initialize passport middleware
app.use(passport.initialize())
app.use(passport.session())

//require routes
const reviewRoutes = require('./Routes/review_routes')
const authRoutes = require('./Routes/auth_routes')

//middlewares
app.use('/api/reviews', reviewRoutes)
app.use('/api/auth', authRoutes)
 

//middleware to track requests in the console
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
}) 

//connect to db
mongoose.connect(process.env.SERVER_URI)
    .then(() => {
        console.log('Connected to DB')
        app.listen(process.env.PORT, () => 
            {
                console.log('Server is running on port ' + process.env.PORT)
            })
    })
    .catch((error) => {
        console.log('Error connecting to DB:\n\n', error)
    })


