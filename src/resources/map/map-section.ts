module Settlers {

    /** provides information about a section in a map file */
    export class MapSection {
        public sourceLength:number;
        public sourceOffset:number;

        public sectionType:MapSectionType;
        public unpackedLength:number;
        public checksum:number;
        public unknown1:number;
        public unknown2:number;

        private data: BinaryReader;

        public getReader() : BinaryReader {
            let c = new Uncompress();
            return c.unpack(this.data, this.sourceOffset, this.sourceLength, this.unpackedLength);
        }


        /** return the position of the next section header in the file */
        public calcNextSectionOffset():number {                
            return this.sourceOffset + this.sourceLength;
        }

        /** read the header of a section */
        public readFromFile(data: BinaryReader, offset:number):boolean {
            const SectionHeaderSize = 24;
            let plainData =  DecodeSettlers.getReader(data, SectionHeaderSize, offset);

            if (plainData.length != SectionHeaderSize) {
                return false;
            }

            this.data = data;
            this.sourceOffset = SectionHeaderSize + offset;

            /// all sections have a type and a length... also the "end of file" section
            this.sectionType = plainData.readIntBE();
            this.sourceLength = plainData.readIntBE();

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
            return "Section @ "+ this.sourceOffset +", size: "+ this.unpackedLength +"; Type="+ this.sectionType +"; checksum="+ this.checksum +", unknown1="+ this.unknown1 +", unknown2="+ this.unknown2;
        }

	}
	
}