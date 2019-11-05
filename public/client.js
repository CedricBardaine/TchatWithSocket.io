/*global io*/
var socket = io();

/**
 * Envoi d'un message
 */
$('#chat form').submit(function (e) {
  e.preventDefault();
  var message = {
    text : $('#m').val()
  };
  $('#m').val('');
  if (message.text.trim().length !== 0) { // Gestion message vide
    socket.emit('chat-message', message);
  }
  $('#chat input').focus(); // Focus sur le champ du message
});

/**
 * Réception d'un message
 */
socket.on('chat-message', function (message) {
  $('#messages').append($('<li>').html('<span class="username" style="background:'+message.usercolor+';"> ' + message.username + '</span>' + message.text) ) ;
  scrollToBottom() ; 
});

/**
 * User connection :
 */
$('#login form').submit(function(e) {
  e.preventDefault() ; 
  var user = {
    username : $('#login input').val().trim(),
    usercolor : $('#idColor').val()
  }; 
  if (user.username.length > 0) {
    socket.emit('user-login', user, function (success) {
      if (success) {
        $('body').removeAttr('id') ; 
        $('#chat input').focus() ;
      }
    }) ; 
  }
})

/**
 * Réception d'un msg
 */
socket.on('service-message' , function( message) {
  $('#messages').append( $( '<li class="'+message.type+'">' ).html('<span class="info">' + message.text + '</span>') ) ; 
  scrollToBottom() ; 
})


/**
 * Scroll vers le bas de page si l'utilisateur n'est pas remonté pour lire d'anciens messages
 */
function scrollToBottom() {
  if ($(window).scrollTop() + $(window).height() + 2 * $('#messages li').last().outerHeight() >= $(document).height()) {
    $("html, body").animate({ scrollTop: $(document).height() }, 0);
  }
}




/**
 * Connexion d'un nouvel utilisateur
 */
socket.on('user-login', function (user) {
  $('#users').append($('<li class="' + user.username + ' new" style="border: 3px solid '+user.usercolor+'">').html(user.username) ) ;
  setTimeout(function () {
    $('#users li.new').removeClass('new');
  }, 1000);
});

/**
 * Déconnexion d'un utilisateur
 */
socket.on('user-logout', function (user) {
  var selector = '#users li.' + user.username;
  $(selector).remove();
});