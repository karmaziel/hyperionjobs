const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    name: {
        type: String
    },
    qualifications:{
        type: String

    },
    role:{
        type: String,
        default: "Student",
        required: true
    }

  }
)
  
User.plugin(passportLocalMongoose);
  
module.exports = mongoose.model('User', User)