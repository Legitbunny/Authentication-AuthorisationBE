const mongoose = require('mongoose')

require("dotenv").config()

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {console.log('connected successfully')})
    .catch((err) => {
        console.error(err)
        console.log('error connecting')
        process.exit(1)
    })
}