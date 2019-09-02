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
        gfxView.elements.register("list", "gfxSelectImage");
        gfxView.elements.register("info", "gfxInfo");
        gfxView.elements.register("showImage", "gfxShowImage");
      }

      function showImage(gfxImg) {
        gfxView.showImage(gfxImg);
      }

      function loadGfx(gfxFileName) {
        if (!gfxFileName) {
          return;
        }
        
        gfxView.load(gfxFileName);
      }
      
    </script>

  </head>
  <body onload="init();">

    <select id="selectGfx" onchange="loadGfx(this.value)" class="fullsize">
      <option>--- select gfx ---</option>
      <option>0</option>
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
      <option>6</option>
      <option>7</option>
      <option>8</option>
      <option>9</option>
      <option>10</option>
      <option>11</option>
      <option>12</option>
      <option>13</option>
      <option>14</option>
      <option></option>
      <option>18</option>
      <option>19</option>
      <option>20</option>
      <option>21</option>
      <option>22</option>
      <option>23</option>
      <option>24</option>
      <option></option>
      <option>28</option>
      <option>29</option>
      <option>30</option>
      <option>31</option>
      <option>32</option>
      <option>33</option>
      <option>34</option>
      <option>35</option>
      <option>36</option>
      <option>37</option>
      <option></option>
      <option>39</option>
      <option>40</option>
      <option>41</option>
    </select>
    
    <select id="gfxSelectImage" onchange="showImage(this.value)" class="fullsize">
    </select>

    <pre id="gfxInfo" class="fullsize" >[no file selected]</pre>
 
    <br />

    <canvas height="800" width="800" id="gfxShowImage" class="1PixelatedRendering">
      Sorry! Your browser does not support HTML5 Canvas and can not run this Application.
    </canvas>

  </body>
</html>




