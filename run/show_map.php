<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
	
	  <link rel="stylesheet" type="text/css" href="style.css">
	
    <title>Settlers.ts Remake</title>

    <script type="text/javascript" src="settlers.js?<?= time(); ?>"></script>

    <script type="text/javascript" >

    var mapView = new Settlers.MapView("./");

    function init() {
        mapView.elements.register("List", "selectChunk");
        mapView.elements.register("mapInfo", "mapInfo");
   
        mapView.elements.register("info", "chunkInfoText");
        
        mapView.elements.register("content", "chunkContent");
        mapView.elements.register("showHexView", "chunkShowHexView");
        mapView.elements.register("showTextView", "chunkShowTextView");

        mapView.elements.register("showImage", "chunkShowImage");
        mapView.elements.register("bytePerPixle", "bytePerPixle");
        mapView.elements.register("byteOffset", "byteOffset");
    }

    function loadMap(mapFileName) {
        mapView.load(mapFileName);
    }
	
  
    function refreshChunk() {
      mapView.showChunk(document.getElementById("selectChunk").value);
    }

    </script>

  </head>
  <body onload="init();">

    <select id="selectMap" onchange="loadMap(this.value)" class="fullsize">
      <option>--- select save game ---</option>
      <optgroup label="Test">
        <option>Siedler4/Save/test.exe</option>
        <option>Siedler4/Save/256.exe</option>
        <option>Siedler4/Save/320.exe</option>
        <option>Siedler4/Save/384.exe</option>
        <option>Siedler4/Save/448.exe</option>
        <option>Siedler4/Save/512.exe</option>
        <option>Siedler4/Save/576.exe</option>
      </optgroup>

      <optgroup label="Test Format">
        <option>Siedler4/Map/Test/formats/land.exe</option>
        <option>Siedler4/Map/Test/formats/land.edm</option>
        <option>Siedler4/Map/Test/formats/land.map</option>
      </optgroup>

      <optgroup label="Singleplayer">
        <option>Siedler4\Map\Singleplayer\Aeneas.map</option>
        <option>Siedler4\Map\Singleplayer\AllGreen.map</option>
        <option>Siedler4\Map\Singleplayer\Assimilate.map</option>
        <option>Siedler4\Map\Singleplayer\BadSurprise.map</option>
        <option>Siedler4\Map\Singleplayer\Bahlum-Kuk.map</option>
        <option>Siedler4\Map\Singleplayer\Camelot.map</option>
        <option>Siedler4\Map\Singleplayer\Chief of the Thieves.map</option>
        <option>Siedler4\Map\Singleplayer\CoastofDeath.map</option>
        <option>Siedler4\Map\Singleplayer\Conspiracy.map</option>
        <option>Siedler4\Map\Singleplayer\Cordoba.map</option>
        <option>Siedler4\Map\Singleplayer\DarkThunder.map</option>
        <option>Siedler4\Map\Singleplayer\Eleven Towers.map</option>
        <option>Siedler4\Map\Singleplayer\FearFortress.map</option>
        <option>Siedler4\Map\Singleplayer\Fledermaus.map</option>
        <option>Siedler4\Map\Singleplayer\Flying Horror.map</option>
        <option>Siedler4\Map\Singleplayer\Fortress.map</option>
        <option>Siedler4\Map\Singleplayer\FreedomForce.map</option>
        <option>Siedler4\Map\Singleplayer\Golden Land.map</option>
        <option>Siedler4\Map\Singleplayer\Grand Thief Settlers.map</option>
        <option>Siedler4\Map\Singleplayer\Harbour Island.map</option>
        <option>Siedler4\Map\Singleplayer\Harbour.map</option>
        <option>Siedler4\Map\Singleplayer\Himalaya.map</option>
        <option>Siedler4\Map\Singleplayer\Karthago.map</option>
        <option>Siedler4\Map\Singleplayer\LanoEstacado.map</option>
        <option>Siedler4\Map\Singleplayer\Limes.map</option>
        <option>Siedler4\Map\Singleplayer\MagicBarbarian.map</option>
        <option>Siedler4\Map\Singleplayer\Meteors.map</option>
        <option>Siedler4\Map\Singleplayer\MiddleIslands.map</option>
        <option>Siedler4\Map\Singleplayer\Mislead Alliance.map</option>
        <option>Siedler4\Map\Singleplayer\Monster.map</option>
        <option>Siedler4\Map\Singleplayer\NewStart.map</option>
        <option>Siedler4\Map\Singleplayer\Papilion.map</option>
        <option>Siedler4\Map\Singleplayer\Pathes.map</option>
        <option>Siedler4\Map\Singleplayer\Phoenix.map</option>
        <option>Siedler4\Map\Singleplayer\SearchofMjoelnir.map</option>
        <option>Siedler4\Map\Singleplayer\SettleDown.map</option>
        <option>Siedler4\Map\Singleplayer\Sherwoodforest.map</option>
        <option>Siedler4\Map\Singleplayer\Surrounded.map</option>
        <option>Siedler4\Map\Singleplayer\TheCross.map</option>
        <option>Siedler4\Map\Singleplayer\Wacah Chan.map</option>
      </optgroup>

      <optgroup label="Multiplayer">
        <option>Siedler4\Map\Multiplayer\4 Isles.map</option>
        <option>Siedler4\Map\Multiplayer\Alien.map</option>
        <option>Siedler4\Map\Multiplayer\AncientGlory.map</option>
        <option>Siedler4\Map\Multiplayer\Arena.map</option>
        <option>Siedler4\Map\Multiplayer\Barretar.map</option>
        <option>Siedler4\Map\Multiplayer\Big Brother.map</option>
        <option>Siedler4\Map\Multiplayer\Big Moloch.map</option>
        <option>Siedler4\Map\Multiplayer\Borderline.map</option>
        <option>Siedler4\Map\Multiplayer\Central.map</option>
        <option>Siedler4\Map\Multiplayer\CentraPoint.map</option>
        <option>Siedler4\Map\Multiplayer\Choices.map</option>
        <option>Siedler4\Map\Multiplayer\Clan Fun.map</option>
        <option>Siedler4\Map\Multiplayer\Cockroach.map</option>
        <option>Siedler4\Map\Multiplayer\Countdown.map</option>
        <option>Siedler4\Map\Multiplayer\Deadsimple.map</option>
        <option>Siedler4\Map\Multiplayer\Dollar.map</option>
        <option>Siedler4\Map\Multiplayer\DoubleCross.map</option>
        <option>Siedler4\Map\Multiplayer\Eris.map</option>
        <option>Siedler4\Map\Multiplayer\Interdependence.map</option>
        <option>Siedler4\Map\Multiplayer\InTrouble.map</option>
        <option>Siedler4\Map\Multiplayer\Island Jumping.map</option>
        <option>Siedler4\Map\Multiplayer\Islands.map</option>
        <option>Siedler4\Map\Multiplayer\Issos Brawl.map</option>
        <option>Siedler4\Map\Multiplayer\Keep Smiling.map</option>
        <option>Siedler4\Map\Multiplayer\Lenara.map</option>
        <option>Siedler4\Map\Multiplayer\Macaton.map</option>
        <option>Siedler4\Map\Multiplayer\Marathon.map</option>
        <option>Siedler4\Map\Multiplayer\Massada.map</option>
        <option>Siedler4\Map\Multiplayer\Mount Doom.map</option>
        <option>Siedler4\Map\Multiplayer\Nightmare.map</option>
        <option>Siedler4\Map\Multiplayer\Oasis.map</option>
        <option>Siedler4\Map\Multiplayer\Omega.map</option>
        <option>Siedler4\Map\Multiplayer\Orbit.map</option>
        <option>Siedler4\Map\Multiplayer\Outback.map</option>
        <option>Siedler4\Map\Multiplayer\Planets.map</option>
        <option>Siedler4\Map\Multiplayer\Rivers.map</option>
        <option>Siedler4\Map\Multiplayer\Rocks.map</option>
        <option>Siedler4\Map\Multiplayer\Roemerberg.map</option>
        <option>Siedler4\Map\Multiplayer\Rush Me.map</option>
        <option>Siedler4\Map\Multiplayer\Rush Puppy.map</option>
        <option>Siedler4\Map\Multiplayer\Schmetterling.map</option>
        <option>Siedler4\Map\Multiplayer\SeaQuest.map</option>
        <option>Siedler4\Map\Multiplayer\SixPack.map</option>
        <option>Siedler4\Map\Multiplayer\Stripeland.map</option>
        <option>Siedler4\Map\Multiplayer\Terror.map</option>
        <option>Siedler4\Map\Multiplayer\Tomb.map</option>
        <option>Siedler4\Map\Multiplayer\Treasure Island.map</option>
        <option>Siedler4\Map\Multiplayer\UnitedNations.map</option>
        <option>Siedler4\Map\Multiplayer\Utopia.map</option>
        <option>Siedler4\Map\Multiplayer\Virus.map</option>
        <option>Siedler4\Map\Multiplayer\WheelOfFortune.map</option>
        <option>Siedler4\Map\Multiplayer\XTerminate.map</option>
      <optgroup>

      <optgroup label="Tutorial">
        <option>Siedler4\Map\Tutorial\Tutorial01.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial02.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial03.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial04.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial05.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial06.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial07.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial08.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial09.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial10.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial11.map</option>
        <option>Siedler4\Map\Tutorial\Tutorial12.map</option>
      </optgroup>
    </select>
    
    <pre id="mapInfo" class="fullsize" >[no map selected]</pre>

    <select id="selectChunk" onchange="mapView.showChunk(this.value)" class="fullsize">
    </select>

    <pre id="chunkInfoText" class="fullsize" >[no section selected]</pre>


    <label><input type="checkbox" value="1" id="chunkShowHexView" />Show Hex View</label>
    <label><input type="checkbox" value="1" id="chunkShowTextView" />Show Text</label> 

    <button onclick="refreshChunk()">refresh</button>
    
    <pre id="chunkContent" class="fullsize" ></pre>
    
    <br />

    <label>Bytes per Pixle: <input type="text" value="1" id="bytePerPixle" /></label>
    <label>Byte offset: <input type="text" value="0" id="byteOffset" /></label>
    
    <br />

    <canvas height="800" width="800" id="chunkShowImage" class="1PixelatedRendering">
      Sorry! Your browser does not support HTML5 Canvas and can not run this Application.
    </canvas>

  </body>
</html>


