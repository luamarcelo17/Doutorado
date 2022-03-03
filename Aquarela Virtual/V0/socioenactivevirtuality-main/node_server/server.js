const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const serviceSocket = require('./aquarela_io');
const clientIO = serviceSocket().getConnection();

const cors = require('cors');
const { Server } = require('http');

app.use(cors());


app.get("/", (req,res)=>{
    res.writeHead(200, {'Content-Type': 'text/plain'});
   res.end('I\'m Alive\n')
});

io.on('connection', socket => {
    console.log("ON");
    
    socket.on('disconnect', ()=> {
            console.log('disconnected: ' + socket.id);
     });

    socket.on('onserver_aquarela', data =>{
        console.log("Para: " + data.tag);
	let tag = data.tag;
	delete data.tag;
        clientIO.emit(tag,data);
    });
    
    clientIO.on('remote_aquarela',data=>{
        console.log("Para: "+ data.tag);
	let tag = data.tag;
	delete data.tag;
        console.log("Valores: " + data);
        socket.emit(tag,data);
    });

});

http.listen(8000, '0.0.0.0',err => {
    if(err){
        console.log(err);
    }else{
        console.log("Listening on port " + 8000);
    }
});
