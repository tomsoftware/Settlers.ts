import { BinaryReader } from '@/resources/file/binary-reader';
import { LogHandler } from '@/utilities/log-handler';
import { MapSize } from '@/utilities/map-size';
import { GeneralMapInformation } from '../../general-map-information';
import { IMapLandscape } from '../../imap-landscape';
import { IMapLoader } from '../../imap-loader';
import { MapChunkType } from '../map-chunk-type';
import { OriginalLandscape } from '../original-landscape';
import { OriginalMapFile } from '../original-map-file';

/** load original save game */
export class SaveGameLoader extends OriginalMapFile implements IMapLoader {
        private oriLog: LogHandler = new LogHandler('SaveGameLoader');

        public general = new GeneralMapInformation();
        public mapSize: MapSize = new MapSize(0, 0);

        public unknown1 = 0;
        public unknown2= 0;
        public unknown3= 0;
        public unknown4= 0;
        public unknown5= 0;
        public unknown6= 0;

        constructor(data: BinaryReader) {
            super(data);

            this.readGeneralInformation();

            this.oriLog.debug(this.general.toString());
        }

        private _landscape?: OriginalLandscape;
        get landscape(): IMapLandscape {
            if (!this._landscape) {
                this._landscape = new OriginalLandscape(this, this.mapSize, MapChunkType.SaveGameMapLandscape);
            }
            return this._landscape;
        }

        public readGeneralInformation(): boolean {
            const reader = this.getChunkReader(MapChunkType.SaveGameGeneralInformation, 32);
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

            const mapSize = reader.readIntBE(28);
            this.mapSize = new MapSize(mapSize, mapSize);

            return true;
        }

        public toString(): string {
            return this.general.toString() + '; ' +
                        this.mapSize.toString() + '; ' +
                        'unk1: ' + this.unknown1 + '; ' +
                        'unk2: ' + this.unknown2 + '; ' +
                        'unk3: ' + this.unknown3 + '; ' +
                        'unk4: ' + this.unknown4 + '; ' +
                        'unk5: ' + this.unknown5 + '; ' +
                        'unk6: ' + this.unknown6 + '; ';
        }
}
