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
    otp: {
        type: Number
    },

    otpExpireTime: {
        type: Date
    },
    isVerified: {
        type: Boolean
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

User.methods.addTask = function (task) {
    this.todoTask.push(task);
    return this.save()
}

User.methods.removeTask = function (taskId) {
    const updatedTasks = this.todoTask.filter(item => {
        return item._id.toString() !== taskId.toString();
    });
    this.todoTask = updatedTasks;
    return this.save();
}

module.exports = mongoose.model("User", User);