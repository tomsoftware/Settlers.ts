

module Settlers {

    /** Information about one file in the lib */
    export class LibFileItem {

        public fileName: string = "";

        public offset: number = 0;

        public length: number = 0;
        public decompressedLength: number = 0;

        public pathIndex: number = 0;
        public unknown: number = 0;

        public isCompressed: boolean = false;
        public checksum: number = 0;

        private reader: BinaryReader;
        private pathName: string;


        /** read this item from BinaryReader */
        public read(data: BinaryReader, fileName: string, pathNames: PathList): boolean {
            this.reader = new BinaryReader(data);

            this.fileName = fileName;

            this.offset = data.readIntBE();
            this.length = data.readIntBE();
            this.decompressedLength = data.readIntBE();
            this.pathIndex = data.readWordBE();
            this.unknown = data.readWordBE();
            this.isCompressed = data.readIntBE() == 1;
            this.checksum = data.readIntBE();

            this.pathName = pathNames.getPath(this.pathIndex);

            return (!data.eof());
        }

        /** return the full "path+file name of this file */
        public getFullName(): string {
            return this.pathName + "/" + this.fileName;
        }


        public checkChecksum(): boolean {
            let c1 = ChecksumCalculator.calc(this.reader, this.offset, this.length);
            return (c1 == this.checksum);
        }


        /** return the data reader for a given filename */
        public getReader(): BinaryReader {

            let fullName = this.reader.filename + "/" + this.getFullName();

            if (!this.isCompressed) {
                return new BinaryReader(this.reader, this.offset, this.length, fullName);
            }
            else {
                let uncompress = new Uncompress();
                let reader = uncompress.unpack(this.reader, this.offset, this.length, this.decompressedLength);
                reader.filename = fullName;

                return reader;
            }
        }

        public toString(): string {
            return "Name: " + this.getFullName() + ";  PathId: " + this.pathIndex + ";  Offset: " + this.offset
                + ";  Length: " + this.length + ";  DecompressedLength: " + this.decompressedLength
                + ";  isCompressed: " + this.isCompressed + ";  Checksum: " + this.checksum + ";  Unknown: " + this.unknown;
        }

    }
}
