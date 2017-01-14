<?php
//creating Event stream
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

$state=strip_tags($_GET['state']);
$player=strip_tags($_GET['player']);
$move=strip_tags($_GET['move']);
$target=strip_tags($_GET['target']);

function sendMove($move) {
  echo "data: $move" . PHP_EOL;
  ob_flush();
  flush();
}

if(!empty($state) && !empty($player) && !empty($move) && !empty($target)){
  $fp = fopen("_game.txt", 'a');
  fwrite($fp, $state.':'.$player.':'.$move.':'.$target.PHP_EOL);
  fclose($fp);
}

if(file_exists("_game.txt") && filesize("_game.txt") > 0){
 $arrhtml=array_reverse(file("_game.txt"));
 $html=$arrhtml[0];
}

if(filesize("_game.txt") > 10000){
  unlink("_game.txt");
}

sendMove($html);
