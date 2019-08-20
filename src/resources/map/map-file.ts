module Settlers {

    /** provides access to a settlers map file (save game or map) */
    export class MapFile {

        private log: LogHandler = new LogHandler("MapFile");
        private checksum: number;
        private mapFileVersion: MapFileVersion;

        private mapSections: MapSection[] = [];

        constructor(data: BinaryReader) {
            this.processFile(data);
        }


        public getSectionCount() {
            return this.mapSections.length;
        }

        public getSection(index:number) {
            return this.mapSections[index];
        }


        private processFile(data: BinaryReader) {

            let dataStartOffset = 6656;

            /// settler4 savegames are prefixed by a windows executable
            if ((data.length > dataStartOffset) && (data.readString(4, 0) != "MZ\x90\x00")) {
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

                let newSection = new MapSection();
                if (!newSection.readFromFile(data, offset)) {
                    return;
                }

                this.mapSections.push(newSection);

                offset = newSection.calcNextSectionOffset();
            }

        }
    }



}
