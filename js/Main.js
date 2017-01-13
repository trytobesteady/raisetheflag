"use strict";

var Main = function() {
  var exports = {};

  exports.playerOneA;
  exports.playerOneB;
  exports.playerTwoA;
  exports.playerTwoB;
  exports.currentGameObject;
  exports.playerBlockedTiles = [
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1]
  ];

  var container, stats;
  var mouse = new THREE.Vector2(), INTERSECTED;
  var camera, controls, raycaster, scene, renderer;
  var playerOneA, playerOneB, playerTwoA, playerTwoB;
  var boxSize = 200;
  var lookAtScene = true;
  var gameMessageDomObject;
  var errorMessageDomObject;
  var buttonNext;
  var gameMessages = ['0 Placement Phase: <br>Place Your Pieces Anywhere On The Board.',
                      '1 Red Turn: Move',
                      '2 Red Turn: Build',
                      '3 Blue Turn: Move',
                      '4 Blue Turn: Build',
                      '5 Win'
  ]

  exports.availableMovesRed = 1;
  exports.availableMovesBlue = 1;
  var layerColors = [0xfee4a2, 0xfdfac2, 0xd9d746, 0xf7f461];
  var lightHelper;

  exports.resetHighlights = function() {
    exports.playerOneA.material.color.setHex(0xFF0000);
    exports.playerOneB.material.color.setHex(0xFF0000);
    exports.playerTwoA.material.color.setHex(0x0000FF);
    exports.playerTwoB.material.color.setHex(0x0000FF);
  }

  function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    console.log(GameState);
    gameMessageDomObject = $('#game-message');
    errorMessageDomObject = $('#error-message');
    buttonNext = $('#button-next')[0];

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.x = 2000;
    camera.position.y = 2000;
    camera.position.z = 2000;
    scene = new THREE.Scene();

    // Zero
    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshPhongMaterial({
      color: 0x00ff00
    });
    var cube = new THREE.Mesh(geometry, material);
    cube.position.x = 500;
    cube.position.y = 110;
    cube.position.z = 500;
    cube.receiveShadow = true;
    //scene.add( cube );

    // Grid
    var gridSize = 500;
    var divisions = 5;
    var gridHelper = new THREE.GridHelper(gridSize, divisions);
    gridHelper.position.x = 500;
    gridHelper.position.y = 15;
    gridHelper.position.z = 500;
    gridHelper.userData.id = 'grid';
    //scene.add( gridHelper );

    //Player
    var playerGeometry = new THREE.CylinderBufferGeometry(50, 50, 100, 32);
    var materialRedA = new THREE.MeshPhongMaterial({
      color: 0xFF0000
    });
    var materialRedB = new THREE.MeshPhongMaterial({
      color: 0xFF0000
    });
    exports.playerOneA = new THREE.Mesh(playerGeometry, materialRedA);
    exports.playerOneB = new THREE.Mesh(playerGeometry, materialRedB);
    exports.playerOneA.userData.type = 'playerpiece';
    exports.playerOneA.userData.color = 'red';
    exports.playerOneA.userData.id = 0;
    exports.playerOneA.userData.pos = [-1, -1, -1];
    exports.playerOneA.position.x = -200;
    exports.playerOneA.position.y = 100;
    exports.playerOneA.position.z = 50;
    exports.playerOneA.castShadow = true;
    exports.playerOneA.receiveShadow = true;
    scene.add(exports.playerOneA);

    exports.playerOneB.userData.type = 'playerpiece';
    exports.playerOneB.userData.color = 'red';
    exports.playerOneB.userData.id = 1;
    exports.playerOneB.userData.pos = [-1, -1, -1];
    exports.playerOneB.position.x = -200;
    exports.playerOneB.position.y = 100;
    exports.playerOneB.position.z = 200;
    exports.playerOneB.castShadow = true;
    exports.playerOneB.receiveShadow = true;
    scene.add(exports.playerOneB);

    var materialBlueA = new THREE.MeshPhongMaterial({
      color: 0x0000FF
    });
    var materialBlueB = new THREE.MeshPhongMaterial({
      color: 0x0000FF
    });
    exports.playerTwoA = new THREE.Mesh(playerGeometry, materialBlueA);
    exports.playerTwoB = new THREE.Mesh(playerGeometry, materialBlueB);
    exports.playerTwoA.userData.type = 'playerpiece';
    exports.playerTwoA.userData.color = 'blue';
    exports.playerTwoA.userData.id = 2;
    exports.playerTwoA.userData.pos = [-1, -1, -1];
    exports.playerTwoA.position.x = 1200;
    exports.playerTwoA.position.y = 100;
    exports.playerTwoA.position.z = 800;
    exports.playerTwoA.castShadow = true;
    exports.playerTwoA.receiveShadow = true;
    scene.add(exports.playerTwoA);

    exports.playerTwoB.userData.type = 'playerpiece';
    exports.playerTwoB.userData.color = 'blue';
    exports.playerTwoB.userData.id = 3;
    exports.playerTwoB.userData.pos = [-1, -1, -1];
    exports.playerTwoB.position.x = 1200;
    exports.playerTwoB.position.y = 100;
    exports.playerTwoB.position.z = 950;
    exports.playerTwoB.castShadow = true;
    exports.playerTwoB.receiveShadow = true;
    scene.add(exports.playerTwoB);

    // Cubes
    var planeGeometry = new THREE.PlaneGeometry(boxSize, boxSize, 1);
    var row = -1;
    var col = -1;
    var lay = 0;

    for (var i = 0; i < 25; i++) {
      var plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({
        color: layerColors[0]
      }));

      plane.userData.type = 'gridpiece';
      // add new row when restless dividable by 5
      col++;
      if (i % 5 == 0) {
        row++;
        col = 0;
      }

      plane.userData.pos = [row, col, lay];

      var j = i % 5;
      plane.position.x = boxSize * j + boxSize / 2;
      plane.position.y = 50;
      plane.position.z = boxSize * row + boxSize / 2;
      plane.rotation.x = Math.PI / -2;
      plane.receiveShadow = true;
      scene.add(plane);
    }

    var boardCenter = new THREE.Object3D();
    boardCenter.position.set(500, 100, 500);
    scene.add(boardCenter);

    // Lights
    var ambient = new THREE.AmbientLight(0x404040); // soft white light
    ambient.position.set(0, 1500, 0);
    ambient.intensity = 0.6;
    scene.add(ambient);

    var light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2);
    light.position.set(1000, 1500, 1000);
    light.castShadow = true;
    light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 100, 3000));
    light.shadow.bias = 0.0001;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.penumbra = 0.1;
    light.decay = 0;
    light.angle = Math.PI / 4;
    light.intensity = 0.4;
    light.distance = 3000;
    light.target = boardCenter;
    scene.add(light);

    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setClearColor(0xf0f0f0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    container.appendChild(renderer.domElement);

    lightHelper = new THREE.SpotLightHelper(light);
    scene.add(lightHelper);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(500, 0, 500);

    stats = new Stats();
    container.appendChild(stats.dom);
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('click', onClick, false);
    buttonNext.addEventListener('click', onButtonNext);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onClick(event) {
    if (exports.currentGameObject) {
      if (exports.currentGameObject.userData != undefined) {
        GameState.checkState(exports.currentGameObject);
      }
    }
  }

  function onButtonNext(event) {
    event.preventDefault();

    if (allPiecesPlaced()) {
      $(event.currentTarget).css('opacity', 0);
      GameState.setState(1);
      exports.resetHighlights();
      errorMessageDomObject.empty();
    } else {
      errorMessageDomObject.html('Not All Pieces Are Placed On The Board');
    }
  }

  function allPiecesPlaced() {
    var flag = true;
    for (var i = 0; i < exports.playerBlockedTiles.length; i++) {
      for (var j = 0; j < exports.playerBlockedTiles[i].length; j++) {
        if (exports.playerBlockedTiles[i][j] == -1) {
          flag = false;
        }
      }
    }
    return flag;
  }

  exports.moveToTile = function(playerPiece, targetTile) {
    var newLayerIndex = targetTile.userData.pos[2] + 1;
    var newHeight = newLayerIndex * boxSize / 2;

    //bezier tween adjustments
    var bx, bz;
    var dim = 50;
    if (targetTile.position.x > playerPiece.position.x) {
      bx = playerPiece.position.x + dim;
    } else if (targetTile.position.x < playerPiece.position.x) {
      bx = playerPiece.position.x - dim;
    } else {
      bx = playerPiece.position.x;
    }

    if (targetTile.position.z > playerPiece.position.z) {
      bz = playerPiece.position.z + dim;
    } else if (targetTile.position.z < playerPiece.position.z) {
      bz = playerPiece.position.z - dim;
    } else {
      bz = playerPiece.position.z;
    }

    var playerLayer = playerPiece.userData.pos[2];
    var targetLayer = targetTile.userData.pos[2];

    if (playerLayer == targetLayer) {
      TweenMax.to(playerPiece.position, 0.5, {
        x: targetTile.position.x,
        z: targetTile.position.z,
        ease: Sine.easeInOut
      });
    } else if (playerLayer > targetLayer) {
      TweenMax.to(playerPiece.position, 0.5, {
        bezier: [{
            x: bx,
            y: newHeight + 100,
            z: bz
          },
          {
            x: targetTile.position.x,
            y: newHeight,
            z: targetTile.position.z
          }
        ],
        ease: Sine.easeInOut
      });
    } else if (playerLayer < targetLayer) {
      TweenMax.to(playerPiece.position, 0.5, {
        bezier: [{
            x: bx,
            y: newHeight + 200,
            z: bz
          },
          {
            x: targetTile.position.x,
            y: newHeight,
            z: targetTile.position.z
          }
        ],
        ease: Sine.easeInOut
      });
    }

    playerPiece.userData.pos = targetTile.userData.pos;
    updatePlayerBlockedTiles(playerPiece, targetTile);

    //red turn: allow only one move
    if (GameState.state == 1) {
      exports.availableMovesRed--;
      if (exports.availableMovesRed == 0) {
        GameState.setState(2);
      }
    }

    //blue turn: allow only one move
    if (GameState.state == 3) {
      exports.availableMovesBlue--;
      if (exports.availableMovesBlue == 0) {
        GameState.setState(4);
      }
    }

    //win condition
    if (newLayerIndex == 4) {
      GameState.setState(5);
      console.log(playerPiece.userData.color + ' wins!');
    }
  }

  exports.buildOnTile = function(playerPiece, targetTile) {
    exports.resetHighlights();
    var newLayerIndex = targetTile.userData.pos[2] + 1;
    var newHeight = newLayerIndex * boxSize / 2;

    var geometry = new THREE.BoxGeometry(boxSize, boxSize / 2, boxSize);
    var material = new THREE.MeshPhongMaterial({
      color: layerColors[newLayerIndex]
    });
    var newCube = new THREE.Mesh(geometry, material);

    newCube.position.x = targetTile.position.x;
    newCube.position.y = newHeight;
    newCube.position.z = targetTile.position.z;

    newCube.userData.type = targetTile.userData.type;
    newCube.userData.pos = targetTile.userData.pos;

    //shift layer up one unit
    newCube.userData.pos[0] = targetTile.userData.pos[0];
    newCube.userData.pos[1] = targetTile.userData.pos[1];
    newCube.userData.pos[2] = newLayerIndex;
    newCube.castShadow = true;
    newCube.receiveShadow = true;
    scene.add(newCube);

    if (GameState.state != 4) {
      GameState.setState(GameState.state + 1);
    } else {
      GameState.setState(1);
    }
  }

  exports.updateGameMessage = function(id) {
    gameMessageDomObject.html(gameMessages[id]);
  }

  function updatePlayerBlockedTiles(playerPiece, targetTile) {
    var currentPlayerPieceId = playerPiece.userData.id;
    var currentTargetTileId = targetTile.userData.pos;

    exports.playerBlockedTiles[currentPlayerPieceId] = [];
    exports.playerBlockedTiles[currentPlayerPieceId].push(currentTargetTileId[0], currentTargetTileId[1], currentTargetTileId[2]);
  }

  function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    render();
    stats.end();
  }

  var dropInterval = 1;
  var increment = 0;
  var initialLookAt = true;

  function render() {
    lightHelper.update();

    increment++

    if (increment / dropInterval == 1) {
      increment = 0;

      if (initialLookAt) {
        camera.lookAt(new THREE.Vector3(500, 0, 500));
        initialLookAt = false;
      }

      // find intersections
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
          if (INTERSECTED) {
            if (INTERSECTED.material.emissive) {
              INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            }
          }

          INTERSECTED = intersects[0].object;
          exports.currentGameObject = INTERSECTED;

          if (INTERSECTED.material.emissive) {
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);
          }

        }
      } else {
        if (INTERSECTED) {
          if (INTERSECTED.material.emissive) {
            INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
          }
        }
        INTERSECTED = null;
        exports.currentGameObject = null;
      }
      renderer.render(scene, camera);
    }
  }

  $(document).ready(function() {
    init();
    animate();
  });

  return exports;
}();
