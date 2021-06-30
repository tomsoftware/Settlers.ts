import { BinaryReader } from '@/resources/file/binary-reader';
import { ChecksumCalculator } from '@/resources/file/checksum-calculator';
import { LogHandler } from '@/utilities/log-handler';
import { MapFileSourceType } from '../map-file-source-type';
import { MapFileVersion } from '../map-file-version';
import { MapChunk } from './map-chunk';
import { MapChunkType } from './map-chunk-type';

/** provides access to a settlers map file (save game or map) */
export class OriginalMapFile {
        private log = new LogHandler('OriginalMapFile');

        protected checksum = -1;
        protected mapFileVersion = MapFileVersion.Normal;
        protected mapFileSourceType = MapFileSourceType.Unknown;

        private mapChunks: MapChunk[] = [];

        constructor(data: BinaryReader) {
            this.processFileChunks(data);
        }

        public getChunkCount() : number {
            return this.mapChunks.length;
        }

        /** return a chunk by it's index */
        public getChunkByIndex(index:number):MapChunk {
            return this.mapChunks[index];
        }

        /** return a chunk by it's type */
        public getChunkByType(type:MapChunkType): MapChunk | null {
            const s = this.mapChunks;
            for (let i = 0; i < s.length; i++) {
                if (s[i].chunkType === type) {
                    return s[i];
                }
            }
            return null;
        }

        /** return a reader to the chunk of a given type */
        public getChunkReader(chunkType:MapChunkType, minLength:number | null = null):BinaryReader | null {
            const chunk = this.getChunkByType(chunkType);
            if (!chunk) {
                this.log.error("Unable to find chunk '" + MapChunkType[chunkType] + "' in map file");
                return null;
            }

            const reader = chunk.getReader();

            if (minLength === null) {
                return reader;
            }

            if (reader.length < minLength) {
                this.log.error("Bad length of chunk '" + MapChunkType[chunkType] +
                                        "' in map file. Expect size of " + minLength + ' get ' + reader.length);

                return null;
            }

            return reader;
        }

        /** read the file and all chunks */
        private processFileChunks(data: BinaryReader):boolean {
            /// settler4 save games are prefixed by a windows executable
            if ((data.length < 100)) {
                this.log.error('Not a Settlers save game: ' + data.filename);
                return false;
            }

            let dataStartOffset;
            if (data.readString(4, 0) === 'MZ\x90\x00') {
                /// settler4 save games are prefixed by a windows executable
                this.mapFileSourceType = MapFileSourceType.SaveGame;
                dataStartOffset = 6656;
            } else {
                this.mapFileSourceType = MapFileSourceType.GameMap;
                dataStartOffset = 0;
            }

            if ((data.length <= dataStartOffset + 8)) {
                this.log.error('Not a Settlers save game: ' + data.filename);
            }

            const headerSize = this.readFileHeader(data, dataStartOffset);

            const realChecksum = ChecksumCalculator.calc(data, dataStartOffset + headerSize);

            if (this.checksum !== realChecksum) {
                this.log.error('Checksum mismatch! real: ' + realChecksum + ' != file: ' + this.checksum);
            }

            this.readFileChunks(data, dataStartOffset + headerSize);

            return true;
        }

        /** read the main file header */
        private readFileHeader(data: BinaryReader, offset: number) {
            /// start of the save game data
            data.setOffset(offset);

            this.checksum = data.readIntBE();
            this.mapFileVersion = data.readIntBE();

            this.log.debug('Save game version: ' + this.mapFileVersion + ' checksum: ' + this.checksum);

            /// size of header
            return 4 * 2;
        }

        private readFileChunks(data: BinaryReader, offset: number) {
            while (offset > 0) {
                const newSection = new MapChunk();
                if (!newSection.readFromFile(data, offset)) {
                    return;
                }

                this.mapChunks.push(newSection);

                offset = newSection.calcNextChunkOffset();
            }
        }
}
