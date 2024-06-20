const express = require("express");
const http = require('http')
const app = express();


const chatroute = require("./routes/chat");
const authrization = require("./routes/Auth");
const userRouter = require("./routes/user");
const messageRoute = require("./routes/message");

const db = require("./config/database");
const cookieParser = require("cookie-parser");

var cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const { initialiseSocket } = require("./socket");

// import dotenv file and define port 
require("dotenv").config();
const PORT = process.env.PORT || 4000; 

const server = http.createServer(app);
initialiseSocket(server);

app.use(
    cors({
        origin: "https://sagar-chat-app.netlify.app/",
        credentials: true,
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
);

// middle ware
app.use(express.json());
app.use(cookieParser());

// connect to db 
db.connect();
cloudinaryConnect();

app.use("/api/v1/auth", authrization);
app.use("/api/v1/chat", chatroute);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRoute);


// const {notFound, errHandler, auth} = require("./midddleware/auth");
// app.use(notFound);
// app.use(errHandler);

// activate the server 

server.listen( PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
