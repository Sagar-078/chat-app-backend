const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
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

    profile: {
        type: String,
        required: true
        //default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },

    token: {
        type: String,
    },

    resetPasswordExpries: {
        type: Date
    },

    // additionalDetails: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     ref: "AdditionalDetails"
    // }

},
{
    timestamps: true,
}
);

module.exports = mongoose.model("User", userModel);