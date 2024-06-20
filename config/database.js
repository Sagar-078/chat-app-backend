const mongoose = require("mongoose");

// import instances from .env file or import propertise 
require("dotenv").config();

exports.connect = () => {
    // connect to mongoo db using connect method and get URl from env file 
    mongoose.connect(process.env.MONGOOSE_URL)
    .then(console.log("DB connected successfully"))
    .catch((err) => {
        console.error("error while connecting DB");
        console.log(err.message);
        process.exit(1);
    })
}