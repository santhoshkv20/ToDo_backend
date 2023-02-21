const mongoose = require("mongoose");


const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified:{
        type:Boolean
    },
    todoTask: [
        {
            taskName: {
                type: String,
                required: true

            },
            date: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                required: true
            }
        }
    ]

})

module.exports = mongoose.model("User", User);