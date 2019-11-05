var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [] ; 

/**
* Handling HTTP requests of users by sending them files from 'public' directory
*/
app.use("/", express.static(__dirname + "/public"));

io.on('connection', function (socket) {
  var user ; 
  
  /**
  * When user connect from the form
  */
  socket.on('user-login', function (loggedUser, callback) {
    var userIndex = -1 ; 
    for (let i = 0; i < users.length; i++) {
      if( users[i].username === loggedUser.username) {
        userIndex = i ; 
      }
    }
    /* Emission d'un événement "user-login" pour chaque utilisateur connecté */ 
    for (let i = 0; i < users.length; i++) { socket.emit('user-login' ,  users[i]) ; }
    
    if(loggedUser !== undefined && userIndex === -1) {
      user = loggedUser;
      users.push(user) ; 
      console.log('user logged in : ' + loggedUser.username);
      
      var userServiceMessage = {
        text: 'You logged in as : '+user.username ,
        type: 'login'
      };
      var broadcastServiceMessage = {
        text: user.username+' logged in',
        type: 'login'
      };
      socket.emit('service-message', userServiceMessage) ; 
      socket.broadcast.emit('service-message', broadcastServiceMessage) ; 
      
      io.emit('user-login', user) ; 
      callback(true); 

      //// unused
      // var serviceMessage = {
      //   text: 'User : '+ user.username + ' logged in.' ,
      //   type: 'login'
      // };
      // socket.broadcast.emit('service-message', serviceMessage) ; 

    }
    else {
      callback(false) ; 
    }
    
    
  });
  
  /**
  * Logs of connnection and disconnection from users
  */
  console.log('a user connected');
  socket.on('disconnect', function () {
    if( user !== undefined){
      console.log('user disconected : ' + user.username);
      var serviceMessage = {
        text: user.username + ' disconnected.',
        type: 'logout' 
      }; 
      socket.broadcast.emit('service-message', serviceMessage) ;
      
      var userIndex = users.indexOf(user) ; 
      if ( userIndex !== -1) {
        users.splice(userIndex, 1 ) ; 
      }
      io.emit('user-logout', user) ; 
    }
  });
  
  /**
  * Get the event 'chat-message' and re-sending to all users
  */
  socket.on('chat-message', function (message) {
    message.username = user.username; 
    message.usercolor = user.usercolor;
    io.emit('chat-message', message);
    console.log('Message from : ' + user.username);
  });
});

/**
* running the server and listening to new connection on port 3000
*/
http.listen(3000, function () {
  console.log('Server is listening on localhost:3000');
});