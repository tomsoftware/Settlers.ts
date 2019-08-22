module Settlers {

    enum MapFileSourceType {
        Unknown,
        GameMap,
        EditorMap,
        SaveGame
    };

    /** provides access to a settlers map file (save game or map) */
    export class MapFile {

        private log: LogHandler = new LogHandler("MapFile");
        private checksum: number;
        private mapFileVersion: MapFileVersion;

        private mapChunks: MapChunk[] = [];

        private mapFileSourceType: MapFileSourceType = MapFileSourceType.Unknown;

        constructor(data: BinaryReader) {
            this.processFile(data);
        }


        public getSectionCount() {
            return this.mapChunks.length;
        }

        /** return a section by it's index */
        public getChunkByIndex(index:number) {
            return this.mapChunks[index];
        }

        /** return a section by it's type */
        public getChunkByType(type:MapChunkType) {
            let s = this.mapChunks;
            for(let i=0; i<s.length; i++){
                if(s[i].chunkType == type) {
                    return s[i];
                }
            }
            return null;
        }

        /** Factory the correct map loader */
        public getMapLoader() {
            if (this.mapFileSourceType == MapFileSourceType.GameMap) {
                return new LoadGameMap(this);
            } else if (this.mapFileSourceType == MapFileSourceType.SaveGame) {
                return new LoadSaveGameMap(this);
            }
            else {
                return null;
            }
        }

        private processFile(data: BinaryReader):boolean {
            
            /// settler4 savegames are prefixed by a windows executable
            if ((data.length < 100)) {
                this.log.log("Not a Settlers save game: " + data.filename);
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
                this.log.log("Not a Settlers save game: " + data.filename);
            }

            let headerSize = this.readFileHeader(data, dataStartOffset);

            let realChecksum = ChecksumCalculator.calc(data, dataStartOffset + headerSize);

            if (this.checksum != realChecksum) {
                this.log.log("Checksum mismatch! real: " + realChecksum + " != file: " + this.checksum);
            }

            this.readFileSections(data, dataStartOffset + headerSize);
        }


        /** read the main file header */
        private readFileHeader(data: BinaryReader, offset: number) {
            /// start of the savegame data
            data.setOffset(offset);

            this.checksum = data.readIntBE();
            this.mapFileVersion = data.readIntBE();

            this.log.debug("Save game version: " + this.mapFileVersion + " checksum: " + this.checksum);

            /// size of header
            return 4 * 2;
        }


        private readFileSections(data: BinaryReader, offset: number) {

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
