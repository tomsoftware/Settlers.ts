
module Settlers {

    /** healder of a lib file */
    export class LibFileHeader {
        private log: LogHandler = new LogHandler("LibFileHeader");

        private reader: BinaryReader;

        public headerOffset: number = 0;
        public length: number = 0;
        public unknown: number = 0;

        public pathNameListOffset: number = 0;
        public pathNameListLenght: number = 0;
        public pathNameCount: number = 0;

        public fileNameListOffset: number = 0;
        public fileNameListLenght: number = 0;
        public fileNameCount: number = 0;

        public fileInfoOffset: number = 0;

        private pathes:string[];

        constructor(data: BinaryReader, offset: number) {
            this.reader = new BinaryReader(data);

            if (!this.readHeader(this.reader, offset)) {
                return;
            }
        }


        public getPathes(): string[] {
            if (!(this.pathes)) {
                this.pathes = this.readFileNames(this.reader, this.pathNameListOffset, this.pathNameCount);
            }
            return this.pathes;
        }


        public getItems(): LibFileItem[] {
            let count = this.fileNameCount;

            let result = new Array<LibFileItem>(count);

            let fileNames = this.readFileNames(this.reader, this.fileNameListOffset, this.fileNameCount);

            this.reader.setOffset(this.fileInfoOffset);

            let pathNames = this.getPathes();

            for (let i = 0; i < count; i++) {
                result[i] = new LibFileItem();
                result[i].read(this.reader, fileNames[i], pathNames);
            }

            return result;
        }


        private readHeader(data: BinaryReader, offset: number): boolean {

            const HeaderSize = 6 * 4;

            if (data.length < offset + HeaderSize) {
                this.log.log("Unable to process LibFileHeader of " + data.filename + " - wrong offset");
                return;
            }

            data.setOffset(offset);
            this.headerOffset = offset;

            this.length = data.readIntBE();
            this.unknown = data.readIntBE();
            this.pathNameListLenght = data.readIntBE();
            this.pathNameCount = data.readIntBE();
            this.fileNameListLenght = data.readIntBE();
            this.fileNameCount = data.readIntBE();

            this.pathNameListOffset = this.headerOffset + HeaderSize;
            this.fileNameListOffset = this.pathNameListOffset + this.pathNameListLenght;
            this.fileInfoOffset = this.fileNameListOffset + this.fileNameListLenght;

            return true;
        }


        private readFileNames(data: BinaryReader, offset: number, count: number): string[] {
            if (count <= 0) {
                return new Array<string>(0);
            }

            data.setOffset(offset);

            let list = new Array<string>(count);

            for (let i = 0; i < count; i++) {
                list[i] = data.readNullString();
            }

            return list;
        }


        public toString(): string {
            return "Files: " + this.fileNameCount + "; Pathes:" + this.pathNameCount;
        }



    }
}