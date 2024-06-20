const mongoose = require("mongoose");

const chatmodel = new mongoose.Schema({
    chatName : {
        type: String,
        trim: true
    },
    
    isGroupChat: {
        type: Boolean,
        default: false,
    },

    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },

    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    groupIcon: {
        type: String,
        // required: true
    }
},
{
    timestamps: true,
}
);


module.exports = mongoose.model("Chat", chatmodel);