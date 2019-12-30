# Settlers 4 remake (File Formats)
This is a Settlers 4 (Siedler 4) Remake (it will be :-) ) written in JavaScript (Typescript) so 
  it can be run in you browser.
  

# How to compile:
* Install Node.js : https://nodejs.org/
* Install TypeScript : https://www.typescriptlang.org/#download-links
* run `tsc` in the `src` folder

This will create the `run/settlers.js` file.


# How to start:
* Install Node.js : https://nodejs.org/
* Copy you Settlers files (`game.lib`, `gfx.lib`, `Gfx/0.gfx`, ...) to the `run/Siedler4/` folder
* Run `run/run.bat`. This will start a local Webserver on your PC
* Open: http://localhost:8888/


# Next BIG steps:
1. using webGl to render the state of a game by loading a save game
2. adding game logic to process state changing in the game


# State:
You can access 'all' Settlers file formats

## gfx-file view:
![screenshot](docu/example-gfx-view.png)

## gl-file and gh-file view:
![screenshot](docu/example-gx-view.png)

## lib-file view:
![screenshot](docu/example-lib-view.png)

## map-file view:
![screenshot](docu/example-map-view.png)
