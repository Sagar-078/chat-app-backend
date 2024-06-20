const mongoose = require("mongoose");

const messageModel = new mongoose.Schema({
    // referance of user model create a sender which type of id
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    //for message content tyype
    content: {
        type: String,
        trim: true
    },

    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }
},
{
    timestamps: true,
});

module.exports = mongoose.model("Message", messageModel);
