const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var Job = new Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    requirements: {
        type: String
    },
    location: {
        type: String
    },
    salary: {
        type: Decimal128
    },
    company: {
        type: String
    },
    company_logo: {
        type: String
    },
    dead_line: {
        type: String
    },

})
  
User.plugin(passportLocalMongoose);
  
module.exports = mongoose.model('Job', Job)