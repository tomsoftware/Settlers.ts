module Settlers {


    /** load a .map or a .edm map*/
    export class OriginalMapLoader extends OriginalMapFile implements IMapLoader {
        private log: LogHandler = new LogHandler("OriginalMapLoader");

        public general: GeneralMapInformation;
        public size : Size;
        
        unknown5: number;
        unknown6: number;

        constructor(data: BinaryReader) {
            super(data);
            
            this.readGeneralInformation();
         
            this.log.debug(this.general.toString());

        }

        public readGeneralInformation(): boolean {
            let reader = this.getChunkReader(MapChunkType.MapGeneralInformation, 24);

            if (!reader) {
                return false;
            }

            this.general = new GeneralMapInformation();
            this.general.gameType = reader.readIntBE();
            this.general.playerCount = reader.readIntBE();
            this.general.startResources = reader.readIntBE();
            
            let mapSize = reader.readIntBE();
            this.size = new Size(mapSize, mapSize);

            this.unknown5 = reader.readIntBE();
            this.unknown6 = reader.readIntBE();

            return;
        }

     

        public toString():string {
            return this.general.toString() +"; "
                + this.size.toString() +"; "
                + "unk5: " + this.unknown5 + "; "
                + "unk6: " + this.unknown6 + "; "
        }
    }
}