require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
app.use(express.json()) 


const reviewRoutes = require('./Routes/review_routes') //import review routes

//middleware to log requests in the console
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
}) 

// Use routes for REVIEWS objects 
app.use('/api/reviews', reviewRoutes)


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


