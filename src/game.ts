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
            let fileProvider = new FileProvider(this.rootPath);
/*
            fileProvider.loadBinary(sourcePath).then((b) => {
                let m = new MapFile(b);
            });
*/
            fileProvider.loadBinary("Siedler4/game.lib").then((b) => {
                let r = new LibFileReader(b);

                let fileInfo = r.getFileInfo("Config", "AINames.cfg");
                let file = fileInfo.getFileReader();
                let c1 = ChecksumCalculator.calc(file);
                let c2 = fileInfo.checksum;

                console.log(file.readString());
            });
        };

    }



}
