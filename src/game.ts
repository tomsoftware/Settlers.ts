module Settlers {

    /** provides an game object to controle the game */
    export class Game {


        private log: LogHandler = new LogHandler("Game");
        private rootPath: string;

        constructor(rootPath: string) {
            this.rootPath = rootPath;
        }

        /** load a new game/level */
        public load(sourcePath: string) {
            let file = new FileProvider(this.rootPath);

            file.loadBinary(sourcePath).then((b) => {
                let m = new MapFile(b);
            }
            );
        };

    }



}
