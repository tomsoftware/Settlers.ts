<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    
    <link rel="stylesheet" type="text/css" href="style.css">
    
    <title>Settlers.ts Remake - gh and gl file view</title>

    <script type="text/javascript" src="settlers.js?<?= time(); ?>"></script>


    <script type="text/javascript" >
   
      var ghView = new Settlers.GhView("./");

      function init() {
        ghView.elements.register("list", "ghSelectImage");
        ghView.elements.register("info", "ghInfo");
        ghView.elements.register("showImage", "ghShowImage");
      }

      function showImage(ghImg) {
        ghView.showImage(ghImg);
      }

      function loadGh(ghFileName) {
        if (!ghFileName) {
          return;
        }
        
        ghView.load(ghFileName);
      }
      
    </script>

  </head>
  <body onload="init();">

    <select id="selectGh" onchange="loadGh(this.value)" class="fullsize">
      <option>--- select .g ---</option>
      <option>2.gh5</option>
      <option>2.gh6</option>
      <option>41.gh5</option>
      <option>41.gh6</option>

      <option>2.gl5</option>
      <option>2.gl6</option>
      <option>41.gl5</option>
      <option>41.gl6</option>

    </select>
    
    <select id="ghSelectImage" onchange="showImage(this.value)" class="fullsize">
    </select>

    <pre id="ghInfo" class="fullsize" >[no file selected]</pre>
 
    <br />

    <canvas height="800" width="800" id="ghShowImage" class="1PixelatedRendering">
      Sorry! Your browser does not support HTML5 Canvas and can not run this Application.
    </canvas>

  </body>
</html>




