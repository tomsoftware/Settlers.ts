<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
	
	<link rel="stylesheet" type="text/css" href="style.css">
	
    <title>Settlers.ts Remake</title>

    <script type="text/javascript" src="settlers.js?<?= time(); ?>"></script>


    <script type="text/javascript" >
   
	var libView = new Settlers.LibView("./");

    function init() {
		libView.elements.register("List", "selectLibFile");
        libView.elements.register("content", "fileContent");
		libView.elements.register("info", "fileInfoText");
    }

	function loadLib(libFileName) {
		libView.load(libFileName);
	}
	
    </script>

  </head>
  <body onload="init();">

	<select id="selectLib" onchange="loadLib(this.value)" class="fullsize">
		<option>--- select lib ---</option>
		<option>Siedler4/game.lib</option>
		<option>Siedler4/gfx.lib</option>
    </select>
	
	<select id="selectLibFile" onchange="libView.showLibFile(this.value)" class="fullsize">
    </select>

	<pre id="fileInfoText" class="fullsize" >[no file selected]</pre>

	<pre id="fileContent" class="fullsize"></pre>
  
 
  </body>
</html>




