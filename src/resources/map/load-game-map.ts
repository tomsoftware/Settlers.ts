module Settlers {


    /** load a .map or a .edm map*/
    export class LoadGameMap implements IMapLoader {
        private log: LogHandler = new LogHandler("LoadGameMap");

        public general: GeneralInformation = new GeneralInformation();
        
        constructor(mapFile: MapFile) {
            this.general.readFromGameMap(this.getChunkReader(mapFile, MapChunkType.MapGeneralInformation));
         
            this.log.debug(this.general.toString());

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