/*global io*/
var socket = io();





/**
 * sending message
 */
$('#chat form').submit(function (e) {
  e.preventDefault();
  var message = {
    text : $('#m').val()
  };
  $('#m').val('');
  if (message.text.trim().length !== 0) { 
    socket.emit('chat-message', message);
  }
  $('#chat input').focus(); 
});

/**
 * Getting tchat message
 */
socket.on('chat-message', function (message) {
  $('#messages').append($('<li>').html('<span class="username" style="background:'+message.usercolor+';"> ' + message.username + '</span>' + message.text) ) ;
  scrollToBottom() ; 
});
/**
 * Getting service message
 */
socket.on('service-message' , function( message) {
  $('#messages').append( $( '<li class="'+message.type+'">' ).html('<span class="info">' + message.text + '</span>') ) ; 
  scrollToBottom() ; 
})

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


function scrollToBottom() {
  if ($(window).scrollTop() + $(window).height() + 2 * $('#messages li').last().outerHeight() >= $(document).height()) {
    $("html, body").animate({ scrollTop: $(document).height() }, 0);
  }
}




/**
 * New user connection
 */
socket.on('user-login', function (user) {
  $('#users').append($('<li class="' + user.username + ' new" style="border: 3px solid '+user.usercolor+'">').html(user.username + '<span class="typing">typing...</span>') ) ;
  setTimeout(function () {
    $('#users li.new').removeClass('new');
  }, 1000);
});

/**
 * User disconnection
 */
socket.on('user-logout', function (user) {
  var selector = '#users li.' + user.username;
  $(selector).remove();
});


// ####################################################################
// ####################################################################
// ####################################################################
// Handling typing user

var typingTimer ; 
var isTyping = false ; 

$('#m').keypress(function () {
  clearTimeout(typingTimer);
  if (!isTyping) {
    socket.emit('start-typing');
    isTyping = true;
  }
});

$('#m').keyup(function () {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(function () {
    if (isTyping) {
      socket.emit('stop-typing');
      isTyping = false;
    }
  }, 500);
});


socket.on('update-typing', function (typingUsers) {
  $('#users li span.typing').hide();
  for (i = 0; i < typingUsers.length; i++) {
    $('#users li.' + typingUsers[i].username + ' span.typing').show();
  }
});