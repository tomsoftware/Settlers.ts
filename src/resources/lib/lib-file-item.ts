

module Settlers {

    /** Information about one file in the lib */
    export class LibFileItem {

        public fileName: string = "";

        public offset: number = 0;

        public lenght: number = 0;
        public decompressedLength: number = 0;

        public pathIndex: number = 0;
        public unknown: number = 0;

        public isCompressed: boolean = false;
        public checksum: number = 0;

        private reader:BinaryReader;
        private pathName:string;


        /** read this item from BinaryReader */
        public read(data: BinaryReader, fileName: string, pathNames:string[]): boolean {
            this.reader = data;

            this.fileName = fileName;

            this.offset = data.readIntBE();
            this.lenght = data.readIntBE();
            this.decompressedLength = data.readIntBE();
            this.pathIndex = data.readWordBE();
            this.unknown = data.readWordBE();
            this.isCompressed = data.readIntBE() == 1;
            this.checksum = data.readIntBE();

            this.pathName = pathNames[this.pathIndex];

            return (!data.eof());
        }

        /** return the full "path+file name of this file */
        public getFullName() :string {
            return this.pathName +"/"+ this.fileName;
        }


        /** return the data for a given file */
        public getFileReader(): BinaryReader {

            let fullName = this.reader.filename + "/" + this.getFullName();

            if (!this.isCompressed) {
                return new BinaryReader(this.reader, this.offset, this.lenght, fullName);
            }
            else {
                let uncompress = new Uncompress();
                let reader = uncompress.unpack(this.reader, this.offset, this.lenght, this.decompressedLength);
                reader.filename = fullName;

                return reader;
            }

        }


        public toString(): string {
            return "Name: " + this.fileName + ";  Path: " + this.pathIndex + ";  Offset: " + this.offset 
                + ";  Lenght: " + this.lenght + ";  DecompressedLength: " + this.decompressedLength
                + ";  isCompressed: " + this.isCompressed + ";  Checksum: " + this.checksum + ";  Unknown: " + this.unknown;
        }

    }
}
