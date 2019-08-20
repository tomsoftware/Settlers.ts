module Settlers {

    /** provides information about a section in a map file */
    export class MapSection {

        public length:number;
        public offset:number;

        public sectionType:MapSectionType;
        public unpackedLength:number;
        public checksum:number;
        public unknown1:number;
        public unknown2:number;

        private reader: BinaryReader;

        public getReader() : BinaryReader {
            let c = new Uncompress();
            return c.unpack(this.reader, this.offset, this.length, this.unpackedLength);
        }


        /** return the position of the next section header in the file */
        public calcNextSectionOffset():number {                
            return this.offset + this.length;
        }

        public checkChecksum(): boolean {
            let c1 = ChecksumCalculator.calc(this.reader, this.offset, this.length);
            return (c1 == this.checksum);
        }


        /** read the header of a section */
        public readFromFile(data: BinaryReader, offset:number):boolean {
            const SectionHeaderSize = 24;
            let plainData =  DecodeSettlers.getReader(data, SectionHeaderSize, offset);

            if (plainData.length != SectionHeaderSize) {
                return false;
            }

            this.reader = data;
            this.offset = SectionHeaderSize + offset;

            /// all sections have a type and a length... also the "end of file" section
            this.sectionType = plainData.readIntBE();
            this.length = plainData.readIntBE();

            if (this.sectionType == 0) {
                /// this is the "end of file" section
                return false;
            }

            this.unpackedLength = plainData.readIntBE();
            this.checksum = plainData.readIntBE();
            this.unknown1 = plainData.readIntBE();
            this.unknown2 = plainData.readIntBE();

            return true;
        }


        public toString(): string {
            return "Section @ "+ this.offset +", size: "+ this.unpackedLength +"; Type="+ this.sectionType +"; checksum="
            + this.checksum +", unknown1="+ this.unknown1 +", unknown2="+ this.unknown2;
        }

	}
	
}