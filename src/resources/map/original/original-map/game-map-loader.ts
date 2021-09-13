import { BinaryReader } from '@/resources/file/binary-reader';
import { LogHandler } from '@/utilities/log-handler';
import { MapSize } from '@/utilities/map-size';
import { GeneralMapInformation } from '../../general-map-information';
import { IMapLandscape } from '../../imap-landscape';
import { IMapLoader } from '../../imap-loader';
import { MapChunkType } from '../map-chunk-type';
import { OriginalLandscape } from '../original-landscape';
import { OriginalMapFile } from '../original-map-file';

/** load a .map or a .edm map */
export class OriginalMapLoader extends OriginalMapFile implements IMapLoader {
        private logLoader: LogHandler = new LogHandler('OriginalMapLoader');

        public general: GeneralMapInformation = new GeneralMapInformation();
        public mapSize : MapSize = new MapSize(0, 0);

        public unknown5 = 0;
        public unknown6 = 0;

        constructor(data: BinaryReader) {
            super(data);

            this.readGeneralInformation();

            this.logLoader.debug(this.general.toString());

            Object.seal(this);
        }

        private _landscape: OriginalLandscape | null = null;
        get landscape(): IMapLandscape {
            if (!this._landscape) {
                this._landscape = new OriginalLandscape(this, this.mapSize, MapChunkType.MapLandscape);
            }

            return this._landscape;
        }

        public readGeneralInformation(): boolean {
            const reader = this.getChunkReader(MapChunkType.MapGeneralInformation, 24);

            if (!reader) {
                return false;
            }

            this.general = new GeneralMapInformation();
            this.general.gameType = reader.readIntBE();
            this.general.playerCount = reader.readIntBE();
            this.general.startResources = reader.readIntBE();

            const mapSize = reader.readIntBE();
            this.mapSize = new MapSize(mapSize, mapSize);

            this.unknown5 = reader.readIntBE();
            this.unknown6 = reader.readIntBE();

            return true;
        }

        public toString():string {
            return this.general.toString() + '; ' +
                        this.mapSize.toString() + '; ' +
                        'unk5: ' + this.unknown5 + '; ' +
                        'unk6: ' + this.unknown6 + '; ';
        }
}
