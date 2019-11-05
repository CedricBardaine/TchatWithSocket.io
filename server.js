var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [] ; 

/**
* Gestion des requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
*/
app.use("/", express.static(__dirname + "/public"));

io.on('connection', function (socket) {
  var user ; 
  
  /**
  * Connexion d'un utilisateur via le formulaire
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
        text: 'User : '+user.username+' logged in',
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
  * Log de connexion et de déconnexion des utilisateurs
  */
  console.log('a user connected');
  socket.on('disconnect', function () {
    if( user !== undefined){
      console.log('user disconected : ' + user.username);
      var serviceMessage = {
        text: 'User : ' + user.username + ' disconnected.',
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
  * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
  */
  socket.on('chat-message', function (message) {
    message.username = user.username; // On intègre ici le nom d'utilisateur au message
    message.usercolor = user.usercolor;
    io.emit('chat-message', message);
    console.log('Message de : ' + user.username);
  });
});

/**
* Lancement du serveur en écoutant les connexions arrivant sur le port 3000
*/
http.listen(3000, function () {
  console.log('Server is listening on localhost:3000');
});