import { LogHandler } from '@/utilities/log-handler';
import { MapSize } from '@/utilities/map-size';
import { IMapLandscape } from '../imap-landscape';
import { MapChunkType } from './map-chunk-type';
import { OriginalMapFile } from './original-map-file';

/** provides access to the original landscape data */
export class OriginalLandscape implements IMapLandscape {
        private log: LogHandler = new LogHandler('OriginalLandscape');
        private data: Uint8Array;
        private mapSize: MapSize;

        public constructor(mapFile: OriginalMapFile, mapSize: MapSize, mapChunkType: MapChunkType) {
            this.mapSize = mapSize;

            const reader = mapFile.getChunkReader(mapChunkType);
            if (!reader) {
                this.log.error('No landscape data in this file!');
                this.data = new Uint8Array(0);
                return;
            }

            this.data = reader.getBuffer();
        }

        /** returns every n-th byte of the data buffer */
        public getSlice(offset: number): Uint8Array {
            const land = this.data;
            const result = new Uint8Array(this.mapSize.width * this.mapSize.height);

            if (land.length !== (result.length * 4)) {
                this.log.error('Size of landscape Data is wrong: ' + land.length + '!==' + (result.length * 4));
                return new Uint8Array(0);
            }

            for (let i = offset, j = 0; i < land.length; i += 4, j++) {
                result[j] = land[i];
            }

            return result;
        }

        public getGroundHeight(): Uint8Array {
            return this.getSlice(0);
        }

        public getGroundType(): Uint8Array {
            return this.getSlice(1);
        }
}
