var GameTransmit = {

  chatZone: null,
  name: null,
  state: null,
  player: null,
  move: null,
  target: null,
  oldData: null,
  server: null,
  xhr: null,

  init: function() {
    console.log('init transmit');
    chatZone = document.getElementById("chatZone");
    if (EventSource) {
      this.setPlayerNames();
      this.initServer();
    } else {
      alert("Use latest Chrome or FireFox");
    }
  },

  //Setting user name
  setPlayerNames: function(name, color) {
    var randomName = 'Player' + Math.round(Math.random() * 10000);
    name = randomName;
    name = name.replace(/(<([^>]+)>)/ig, "");
  },

  //sending move
  sendMove: function(gameState, pieceId, moveType, targetId) {
    //playerid = pieceId;
    //move = moveType +':'+targetId;
    state = gameState;
    player = pieceId;
    move = moveType;
    target = targetId;

    //chatZone.innerHTML += pieceId+':'+moveType+':'+targetId+'<br>';
    //GameTransmit.oldData = pieceId+':'+moveType+':'+targetId+'<br>';
    this.ajaxSend(state, pieceId, moveType, targetId);
    return false;
  },

  //sending move to server
  ajaxSend: function() {
    try {
      xhr = new XMLHttpRequest();
    } catch (err) {
      alert(err);
    }

    xhr.open('GET', 'php/gameprocess.php?state=' + state + '&player=' + player + '&move=' + move + '&target=' + target, false);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          //moveType.value = "";
        }
      }
    };
    xhr.send();
  },

  //HTML5 SSE(Server Sent Event) initilization
  initServer: function() {
    server = new EventSource('php/gameprocess.php');

    //update game
    server.onmessage = function(e) {
      //update chat window

      if (GameTransmit.oldData != e.data) {

        if(!chatZone) {
          chatZone = document.getElementById("chatZone");
        }

        //write received data to chatwindow
        chatZone.innerHTML += e.data + '<br>';
        GameTransmit.oldData = e.data;

        var strArr = e.data.split(':')
        var state = strArr[0];
        var pieceId = strArr[1];
        var moveType = strArr[2];
        var targetId = parseInt(strArr[3]);

        console.log('1#', strArr, pieceId);

        //move piece
        if(moveType == 'move') {
          Main.moveToTile(pieceId, targetId);
        } else if(moveType == 'build') {
          Main.buildOnTile(pieceId, targetId);
        }

      }
    };
  }
};
