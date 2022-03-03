(function() {
    const io = require('socket.io-client');
    var socket = null;

    module.exports = function () {
        var service = {
          getConnection : getConnection
      };
      return service;
  };


    function getConnection() {
    const socket = io("http://127.0.0.1:5000/desenho", {reconnect: true});
    //socket = io('http://erytheia.nied.unicamp.br:8000/');
    socket.on('connect', socket =>{
        console.log('Connected (Arquarela - on)!');
    });
    
    socket.on('disconnect', socket=> {
        console.log('Disonnected (Aquarela - off)!');
    });
    return socket;
    }
})();