var ChatEngine = function() {
  var name = "";
  var msg = "";
  var chatZone;
  var oldata = "";
  var server = "";
  var xhr = "";
  //initialzation
  this.init = function() {
    chatZone = document.getElementById("chatZone");

    if (EventSource) {
      this.setName();
      this.initServer();
    } else {
      alert("Use latest Chrome or FireFox");
    }
  };
  //Setting user name
  this.setName = function() {
    //name = prompt("Enter your name:","Chater");
    var randomName = 'name' + Math.random() * 10000;
    name = randomName;

    if (!name || name === "") {
      name = "Chater";
    }
    name = name.replace(/(<([^>]+)>)/ig, "");
  };
  //For sending message
  this.sendMsg = function() {
    msg = document.getElementById("msg").value;
    chatZone.innerHTML += '<div class="chatmsg"><b>' + name + '</b>: ' + msg + '<br/></div>';
    oldata = '<div class="chatmsg"><b>' + name + '</b>: ' + msg + '<br/></div>';
    this.ajaxSent();
    return false;
  };
  //sending message to server
  this.ajaxSent = function() {
    try {
      xhr = new XMLHttpRequest();
    } catch (err) {
      alert(err);
    }
    xhr.open('GET', 'php/chatprocess.php?msg=' + msg + '&name=' + name, false);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          msg.value = "";
        }
      }
    };
    xhr.send();
  };
  //HTML5 SSE(Server Sent Event) initilization
  this.initServer = function() {
    server = new EventSource('php/chatprocess.php');
    server.onmessage = function(e) {
      if (oldata != e.data) {
        if(!chatZone) {
          chatZone = document.getElementById("chatZone");
        }

        chatZone.innerHTML += e.data;
        oldata = e.data;
      }
    };
  };
};
// Creating Object for Chat Engine
var chat = new ChatEngine();
chat.init();
