module Settlers {


    /** load a .map or a .edm map*/
    export class LoadGameMap {
        private log: LogHandler = new LogHandler("LoadGameMap");

        public generalInformation: GeneralInformation= new GeneralInformation();
        
        constructor(mapFile: MapFile) {
            this.generalInformation.readFromGameMap(this.getChunkReader(mapFile, MapChunkType.MapGeneralInformation));
         
            this.log.debug(this.generalInformation.toString());

        }


        private getChunkReader(mapFile: MapFile, chunkType:MapChunkType):BinaryReader {
            let s = mapFile.getChunkByType(MapChunkType.MapGeneralInformation);
            if (!s) {
                this.log.log("Unable to find MapGeneralInformation in map file");
                return;
            }

            return s.getReader();
        }

    }
}