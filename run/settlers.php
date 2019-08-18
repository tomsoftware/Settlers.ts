<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Settlers.ts Remake</title>

    <script type="text/javascript" src="settlers.js?<?= time(); ?>"></script>


    <style> 
      .PixelatedRendering {
         border: 0px;
    }
    </style>

    <script type="text/javascript" >
   
    var game = new Settlers.Game("./");

    function init() {
       
    }

	function loadSaveGame() {
        game.load("Siedler4/Save/test.exe");
    }

	
    </script>

  </head>
  <body onload="init();">

	<button type="button" onClick="loadSaveGame();" />load save game</button>
  
    <canvas height="480" width="800" id="gameCanvas" class="PixelatedRendering">
      Sorry! Your browser does not support HTML5 Canvas and can not run this Application.
    </canvas>

  </body>
</html>




