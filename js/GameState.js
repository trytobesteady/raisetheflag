"use strict";

var GameState = function() {
  var exports = {};
  exports.state = 0;

  var currentPlayerPiece;

  exports.setState = function(state) {
    exports.state = state;
    Main.updateGameMessage(exports.state);
  }

  exports.checkState = function(currentObject) {
    //console.log(exports.state, currentObject.userData);

    switch(exports.state) {
      case 0:

        //PLACEMENT
        if(currentObject.userData.type == 'playerpiece') {
          currentPlayerPiece = currentObject;
          Main.resetHighlights();
          if(currentObject.userData.id == 0) {
            Main.playerOneA.material.color.setHex(0xffb4b4);
          } else if(currentObject.userData.id == 1) {
            Main.playerOneB.material.color.setHex(0xffb4b4);
          } else if(currentObject.userData.id == 2) {
            Main.playerTwoA.material.color.setHex(0xb4b6ff);
          } else if(currentObject.userData.id == 3) {
            Main.playerTwoB.material.color.setHex(0xb4b6ff);
          }
        }

        //moving playerpiece to valid tilepiece
        if(currentObject.userData.type == 'gridpiece' && currentPlayerPiece) {
          if(isValidMove(currentPlayerPiece, Main.currentGameObject, false)){
            //Main.moveToTile(currentPlayerPiece, Main.currentGameObject);
            var gState = 'state'+exports.state;
            var pieceId = 'p' + currentPlayerPiece.userData.id;
            var col = currentPlayerPiece.userData.color;
            var targetId = Main.currentGameObject.id;
            GameTransmit.sendMove(gState, pieceId, 'move', targetId);

          } else {
            //move invalid
          }
        }

        break;
      case 1:
        //resetting available moves
        Main.availableMovesRed = 1;
        Main.availableMovesBlue = 1;

        //RED: MOVE
        if(currentObject.userData.type == 'playerpiece' && currentObject.userData.color == 'red') {
          currentPlayerPiece = currentObject;
          Main.resetHighlights();

          if(currentObject.userData.id == 0) {
            Main.playerOneA.material.color.setHex(0xffb4b4);
          } else if(currentObject.userData.id == 1) {
            Main.playerOneB.material.color.setHex(0xffb4b4);
          }
        }

        //moving playerpiece to valid tilepiece
        if(currentObject.userData.type == 'gridpiece' && currentPlayerPiece.userData.color == 'red') {
          if(isValidMove(currentPlayerPiece, Main.currentGameObject, false)){
            //Main.moveToTile(currentPlayerPiece, Main.currentGameObject);
            var gState = 'state'+exports.state;
            var pieceId = 'p' + currentPlayerPiece.userData.id;
            var col = currentPlayerPiece.userData.color;
            var targetId = Main.currentGameObject.id;
            GameTransmit.sendMove(gState, pieceId, 'move', targetId);

          } else {
            //move invalid
          }
        }

        break;
      case 2:
        //RED: BUILD
        if(isValidMove(currentPlayerPiece, Main.currentGameObject, true)){
          //Main.buildOnTile(currentPlayerPiece, Main.currentGameObject);
          var gState = 'state'+exports.state;
          var pieceId = 'p' + currentPlayerPiece.userData.id;
          var col = currentPlayerPiece.userData.color;
          var targetId = Main.currentGameObject.id;
          GameTransmit.sendMove(gState, pieceId, 'build', targetId);

        } else {
          //placement invalid
        }

        break;
      case 3:
        //BLUE: MOVE
        if(currentObject.userData.type == 'playerpiece' && currentObject.userData.color == 'blue') {
          Main.resetHighlights();

          if(currentObject.userData.id == 2) {
            Main.playerTwoA.material.color.setHex(0xb4b6ff);
            currentPlayerPiece = currentObject;
          } else if(currentObject.userData.id == 3) {
            Main.playerTwoB.material.color.setHex(0xb4b6ff);
            currentPlayerPiece = currentObject;
          }
        }

        //moving playerpiece to valid tilepiece
        if(currentObject.userData.type == 'gridpiece' && currentPlayerPiece.userData.color == 'blue') {
          if(isValidMove(currentPlayerPiece, Main.currentGameObject, false)){
            //Main.moveToTile(currentPlayerPiece, Main.currentGameObject);
            var gState = 'state'+exports.state;
            var pieceId = 'p' + currentPlayerPiece.userData.id;
            var col = currentPlayerPiece.userData.color;
            var targetId = Main.currentGameObject.id;
            GameTransmit.sendMove(gState, pieceId, 'move', targetId);
          } else {
            //move invalid
          }
        }

        break;
      case 4:
        //BLUE: BUILD
        if(isValidMove(currentPlayerPiece, Main.currentGameObject, true)){
          //Main.buildOnTile(currentPlayerPiece, Main.currentGameObject);
          var gState = 'state'+exports.state;
          var pieceId = 'p' + currentPlayerPiece.userData.id;
          var col = currentPlayerPiece.userData.color;
          var targetId = Main.currentGameObject.id;
          GameTransmit.sendMove(gState, pieceId, 'build', targetId);
        } else {
          //placement invalid
        }

        break;
    }
  }

  function isValidMove(playerPiece, targetTile, isBuildMove) {
    //flags
    var allValid = true;
    var isTargetBlockedByPlayer = false;
    var isTargetNotAdjacent = false;
    var isTargetToHigh = false;
    var noMovesLeft = false;
    var isMaximumHeight = false;

    var startRow = playerPiece.userData.pos[0];
    var startCol = playerPiece.userData.pos[1];
    var startLay = playerPiece.userData.pos[2];

    var targetRow = targetTile.userData.pos[0];
    var targetCol = targetTile.userData.pos[1];
    var targetLay = targetTile.userData.pos[2];

    var deltaRow = Math.abs(startRow - targetRow);
    var deltaCol = Math.abs(startCol - targetCol);
    var deltaLay = Math.abs(startLay - targetLay);
    var absLay = startLay - targetLay;


    //extra rule for building UP (can build up to 3 layers)
    if(isBuildMove) {
      if(deltaRow > 1 || deltaCol > 1 || deltaLay > 4) {
        console.log('HIGH DISTANCE BUILDING');
        isTargetNotAdjacent = true;
      }
    } else {
      //check if move is within range
      if(deltaRow > 1 || deltaCol > 1 || deltaLay > 1) {
        isTargetNotAdjacent = true;

        //TODO ALLOWS MORE THAN ONE!
        if(deltaRow > 1 || deltaCol > 1 || absLay > 0) {
          //console.log('FIX: JUMPING FROM A GREAT HEIGHT');
          isTargetNotAdjacent = false;
        }
      }
    }

    //check for maximum height
    if(targetLay > 3) {
      isMaximumHeight = true
    }

    //no range limit in placement phase
    if(exports.state == 0) {
      isTargetNotAdjacent = false;
    }

    //check if a piece has moves left
    if(exports.state == 1 && Main.availableMovesRed == 0) {
      noMovesLeft = true;
    } else if(exports.state == 3 && Main.availableMovesBlue == 0) {
      noMovesLeft = true;
    }

    //check if another playerpiece is in the way
    for (var i = 0; i < Main.playerBlockedTiles.length; i++) {
      if(targetRow == Main.playerBlockedTiles[i][0] && targetCol == Main.playerBlockedTiles[i][1] && targetLay == Main.playerBlockedTiles[i][2]) {
        isTargetBlockedByPlayer = true;
      }
    }

    //sum up flags
    if(isTargetBlockedByPlayer || isTargetNotAdjacent || noMovesLeft || isMaximumHeight) {
      console.log('isBuildMove:', isBuildMove, ' isTargetBlockedByPlayer: ', isTargetBlockedByPlayer, ' isTargetNotAdjacent: ', isTargetNotAdjacent, ' noMovesLeft: ', noMovesLeft, ' isMaximumHeight: ',isMaximumHeight);
      allValid = false;
    }

    return allValid;
  }

  return exports;
}();
