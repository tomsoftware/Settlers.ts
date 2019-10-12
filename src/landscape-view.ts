module Settlers {

    /** provides an game object to controle the game */
    export class LandscapeView {

        public elements: ElementProvider = new ElementProvider();
        private log: LogHandler = new LogHandler("LandscapeView");
        private rootPath: string;
        private game:Game;

        constructor(rootPath: string) {
            this.rootPath = rootPath;
        }


        private showLandscape(game: Game, cav: HTMLCanvasElement) {
            if ((!cav) || (!cav.getContext)) {
                return;
            }

            alert(game.width);

        }


        /** load a new game/level */
        public load(sourcePath: string) {
            let fileProvider = new FileProvider(this.rootPath);

            fileProvider.loadBinary(sourcePath).then((b) => {
                let mapContent = MapLoader.getLoader(b);

                this.game = new Game(mapContent);

                this.showLandscape(this.game, this.elements.get<HTMLCanvasElement>("content"));

            });

        };

    }



}
