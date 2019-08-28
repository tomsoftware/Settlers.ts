<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    
    <link rel="stylesheet" type="text/css" href="style.css">
    
    <title>Settlers.ts Remake - gfx file view</title>

    <script type="text/javascript" src="settlers.js?<?= time(); ?>"></script>


    <script type="text/javascript" >
   
      var gfxView = new Settlers.GfxView("./");

      function init() {
        gfxView.elements.register("list", "selectImage");
      }

      function showImage(gfxImg) {

      }

      function loadGfx(gfxFileName) {
        gfxView.load(gfxFileName);
      }
      
    </script>

  </head>
  <body onload="init();">

    <select id="selectGfx" onchange="loadGfx(this.value)" class="fullsize">
      <option>--- select gfx ---</option>
      <option>Siedler4/gfx/1</option>
      <option>Siedler4/gfx/14</option>

      <option>Siedler4/gfx/18</option>
      <option>Siedler4/gfx/24</option>

      <option>Siedler4/gfx/35</option>
      
      <option>Siedler4/gfx/34</option>
      <!--
      <option>Siedler4/gfx/2</option>
      <option>Siedler4/gfx/7</option>
      <option>Siedler4/gfx/8</option>
      <option>Siedler4/gfx/9</option>
      <option>Siedler4/gfx/10</option>
      <option>Siedler4/gfx/11</option>
      <option>Siedler4/gfx/12</option>
      <option>Siedler4/gfx/13</option>
      <option>Siedler4/gfx/14</option>

      <option>Siedler4/gfx/18</option>
      <option>Siedler4/gfx/19</option>
      <option>Siedler4/gfx/20</option>
      <option>Siedler4/gfx/21</option>
      <option>Siedler4/gfx/22</option>
      <option>Siedler4/gfx/23</option>
      <option>Siedler4/gfx/24</option>

      <option>Siedler4/gfx/28</option>
      <option>Siedler4/gfx/29</option>
      <option>Siedler4/gfx/30</option>
      <option>Siedler4/gfx/31</option>
      <option>Siedler4/gfx/32</option>

      <option>Siedler4/gfx/34</option>
      <option>Siedler4/gfx/35</option>
      <option>Siedler4/gfx/36</option>
      <option>Siedler4/gfx/37</option>

      <option>Siedler4/gfx/39</option>
      <option>Siedler4/gfx/40</option>
      -->
    </select>
    
    <select id="selectImage" onchange="showImage(this.value)" class="fullsize">
    </select>

    <pre id="fileInfoText" class="fullsize" >[no file selected]</pre>

    <pre id="fileContent" class="fullsize"></pre>
  
  </body>
</html>




