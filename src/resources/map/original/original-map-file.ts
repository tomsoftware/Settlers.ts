module Settlers {


    /** provides access to a settlers map file (save game or map) */
    export class OriginalMapFile {

        protected oriLog: LogHandler = new LogHandler("OriginalMapFile");

        protected checksum: number;
        protected mapFileVersion: MapFileVersion;
        protected mapFileSourceType : MapFileSourceType;

        private mapChunks: MapChunk[] = [];


        constructor(data: BinaryReader) {
            this.processFileChunks(data);
        }

        public getChunkCount() {
            return this.mapChunks.length;
        }

        /** return a chunk by it's index */
        public getChunkByIndex(index:number) {
            return this.mapChunks[index];
        }

        /** return a chunk by it's type */
        public getChunkByType(type:MapChunkType) {
            let s = this.mapChunks;
            for(let i=0; i<s.length; i++){
                if(s[i].chunkType == type) {
                    return s[i];
                }
            }
            return null;
        }

        /** return a reader to the chunk of a given type */
        public getChunkReader(chunkType:MapChunkType, minLength?:number):BinaryReader {
            let chunk = this.getChunkByType(chunkType);
            if (!chunk) {
                this.oriLog.log("Unable to find chunk '"+ MapChunkType[chunkType] +"' in map file");
                return null;
            }

            let reader = chunk.getReader();

            if (minLength === null) {
                return reader;
            }
            
            if (reader.length < minLength) {
                this.oriLog.log("Bad length of chunk '"+ MapChunkType[chunkType] 
                        +"' in map file. Expect size of "+ minLength + " get "+ reader.length);

                return null;
            }

            return reader;

        }

        /** read the file and all chunks */
        private processFileChunks(data: BinaryReader):boolean {
            
            /// settler4 savegames are prefixed by a windows executable
            if ((data.length < 100)) {
                this.oriLog.log("Not a Settlers save game: " + data.filename);
                return false;
            }
            
            let dataStartOffset;
            if (data.readString(4, 0) == "MZ\x90\x00") {
                /// settler4 savegames are prefixed by a windows executable
                this.mapFileSourceType = MapFileSourceType.SaveGame;
                dataStartOffset = 6656;
            } else {
                this.mapFileSourceType = MapFileSourceType.GameMap;
                dataStartOffset = 0;
            }

            
            if ((data.length <= dataStartOffset + 8)) {
                this.oriLog.log("Not a Settlers save game: " + data.filename);
            }

            let headerSize = this.readFileHeader(data, dataStartOffset);

            let realChecksum = ChecksumCalculator.calc(data, dataStartOffset + headerSize);

            if (this.checksum != realChecksum) {
                this.oriLog.log("Checksum mismatch! real: " + realChecksum + " != file: " + this.checksum);
            }

            this.readFileChunks(data, dataStartOffset + headerSize);
        }



        /** read the main file header */
        private readFileHeader(data: BinaryReader, offset: number) {
            /// start of the savegame data
            data.setOffset(offset);

            this.checksum = data.readIntBE();
            this.mapFileVersion = data.readIntBE();

            this.oriLog.debug("Save game version: " + this.mapFileVersion + " checksum: " + this.checksum);

            /// size of header
            return 4 * 2;
        }


        private readFileChunks(data: BinaryReader, offset: number) {

            while (offset > 0) {

                let newSection = new MapChunk();
                if (!newSection.readFromFile(data, offset)) {
                    return;
                }

                this.mapChunks.push(newSection);

                offset = newSection.calcNextChunkOffset();
            }

        }
    }



}
