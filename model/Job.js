const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose')
const jobSchema = mongoose.Schema;
var Job = new jobSchema({
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
    publish_date:{
        type: String
    },
    dead_line: {
        type: String
    },
    published_by: {
        type: String
    }

})

module.exports = mongoose.model('Job', Job)