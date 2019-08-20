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
       	mapView.setSectionListElement(document.getElementById("selectSection"));
		mapView.setSectionContentElement(document.getElementById("sectionContent"));
		mapView.setSectionInfoElement(document.getElementById("sectionInfoText"));
		
		
    }

	function loadMap(mapFileName) {
		mapView.load(mapFileName);
	}
	
	
    </script>

  </head>
  <body onload="init();">

	<select id="selectMap" onchange="loadMap(this.value)" class="fullsize">
		<option>--- select save game ---</option>
		<option>Siedler4/Save/test.exe</option>
		<option>Siedler4/Save/1.exe</option>
		<option>Siedler4/Save/2.exe</option>
		<option>Siedler4/Save/3.exe</option>
    </select>
	
	<select id="selectSection" onchange="mapView.showSection(this.value)" class="fullsize">
    </select>

	<pre id="sectionInfoText" class="fullsize" >[no section selected]</pre>

	<pre id="sectionContent" class="fullsize" ></pre>
  
  
  
    <canvas height="480" width="800" id="gameCanvas" class="PixelatedRendering">
      Sorry! Your browser does not support HTML5 Canvas and can not run this Application.
    </canvas>

  </body>
</html>


