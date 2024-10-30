const mongoose = require("mongoose");

require("dotenv").config();

exports.connect = () => {
    
    mongoose.connect(process.env.MONGOOSE_URL)
    .then(console.log("DB connected successfully"))
    .catch((err) => {
        console.error("error while connecting DB");
        console.log(err.message);
        process.exit(1);
    })
}
