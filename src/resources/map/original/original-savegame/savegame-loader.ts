module Settlers {


    /** load original save game */
    export class SaveGameLoader extends OriginalMapFile implements IMapLoader {
        private log: LogHandler = new LogHandler("SaveGameLoader");

        public general: GeneralMapInformation;
        public size: Size;

        unknown1: number;
        unknown2: number;
        unknown3: number;
        unknown4: number;
        unknown5: number;
        unknown6: number;

        constructor(data: BinaryReader) {
            super(data);

            this.readGeneralInformation();

            this.log.debug(this.general.toString());
        }

        private _landscape: OriginalLandscape;
        get landscape(): IMapLandscape {
            if (!this._landscape) {
                this._landscape = new OriginalLandscape(this, this.size, MapChunkType.SaveGameMapLandscape);
            }
            return this._landscape;
        }

        public readGeneralInformation(): boolean {
            let reader = this.getChunkReader(MapChunkType.SaveGameGeneralInformation, 32);
            if (!reader) {
                return false;
            }

            this.general = new GeneralMapInformation();

            this.unknown1 = reader.readIntBE();
            this.unknown2 = reader.readIntBE();
            this.unknown3 = reader.readIntBE();
            this.unknown4 = reader.readIntBE();
            this.unknown5 = reader.readIntBE();
            this.unknown6 = reader.readIntBE();

            let mapSize = reader.readIntBE(28);
            this.size = new Size(mapSize, mapSize);

            return true;
        }


        public toString(): string {
            return this.general.toString() + "; "
                + this.size.toString() + "; "
                + "unk1: " + this.unknown1 + "; "
                + "unk2: " + this.unknown2 + "; "
                + "unk3: " + this.unknown3 + "; "
                + "unk4: " + this.unknown4 + "; "
                + "unk5: " + this.unknown5 + "; "
                + "unk6: " + this.unknown6 + "; "
        }
    }
}