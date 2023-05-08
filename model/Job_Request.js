const mongoose = require('mongoose')
const Schema = mongoose.Schema
var Job_Request = new Schema({
    name: {
        type: String, 
    },
    email: {
        type: String
    },
    portfolio: {
        type: String
    },
    description: {
        type: String
    },
    qualifications:{ 
        type: String
    },
    job: {
        type: String
    },
    jobId: {
        type: String
    }

})

module.exports = mongoose.model('Job_Request', Job_Request)