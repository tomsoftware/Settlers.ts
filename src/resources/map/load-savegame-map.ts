module Settlers {


    /** load a .map or a .edm map*/
    export class LoadSaveGameMap implements IMapLoader {
        private log: LogHandler = new LogHandler("LoadSaveGameMap");

        public general: GeneralInformation = new GeneralInformation();

        constructor(mapFile: MapFile) {
            this.general.readFromSaveGame(this.getChunkReader(mapFile, MapChunkType.SaveGameGeneralInformation));  
        }


        private getChunkReader(mapFile: MapFile, chunkType:MapChunkType):BinaryReader {
            let s = mapFile.getChunkByType(chunkType);
            if (!s) {
                this.log.log("Unable to find MapGeneralInformation in map file");
                return;
            }

            return s.getReader();
        }


        public toString():string {
            return this.general.toString();
        }
    }
}