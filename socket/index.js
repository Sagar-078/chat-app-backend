const {Socket, Server} = require('socket.io')

let io;
exports . initialiseSocket = (server) => {
    io = new Server(server, { cors: { origin: '*'} });
    io.on('connection', (socket) => {
        console.log("Client connected");
        globalsocket = socket;

        socket.on('join_user_room',(userId)=>{
            console.log('Called for join user room',userId)
            socket.join(userId);
        });


        socket.on('leave_user_room',(userId)=>{
            //console.log('Called for leave user room',userId)
            socket.leave(userId);
        });

        socket.on('join_chatId',(chatId)=>{
            // console.log('Called for join',chatId)
            socket.join(chatId);
        });
        socket.on("leave_chatId",(chatId)=>{
            // console.log('Called for leavve',chatId)
            socket.leave(chatId);
        });
    });
};
exports . getio = () => {
    return io;
};
exports . getsocket = () => {
    return globalsocket;
};