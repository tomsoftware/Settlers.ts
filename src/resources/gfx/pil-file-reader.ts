module Settlers {

    /** interpreates a .pil file -
     *  pil may stand for: "palette index file" 
     *  it is a list of file indexes used to read a .pa5 or .pa6 file
     * todo: .gil is the same!
     * */
    export class PilFileReader {

        private log: LogHandler = new LogHandler("PilFileReader");

        /** may this is the file version or a magic indicator for this
         * file type: 0x03 0x80 */
        private magic: number;
        private flag1: number;
        private flag2: number;
        private flag3: number;
        private flag4: number;

        private offsetTable: Array<number>;

        public getTable() {
            return this.offsetTable;
        }

        /** return the number of images stored in the gfx file */
        public getOffsetCount() {
            return this.offsetTable ? this.offsetTable.length : 0;
        }

        /** return a sorted list of all uneque offsets */
        public getDistinct() {
            return [...new Set(this.offsetTable)]
                .sort((index1, index2) => (index2 - index1));
        }

        
        /** return the fileoffset of a gfx image */
        public getPaletteOffset(index: number): number {
            if ((index < 0) || (index >= this.offsetTable.length)) {
                this.log.log("palette-Index out of range: " + index);
                return -1;
            }
            return this.offsetTable[index];
        }

        constructor(reader: BinaryReader) {
            const HeaderSize = 5 * 4;

            if (reader.length < HeaderSize) {
                this.log.log("wrong file size");
                return;
            }

            let imageCount = (reader.length - HeaderSize) / 4;
            this.log.debug('palette count ' + imageCount);

            this.offsetTable = new Array<number>(imageCount);

            /// file header
            this.magic = reader.readIntBE();
            this.flag1 = reader.readIntBE();
            this.flag2 = reader.readIntBE();
            this.flag3 = reader.readIntBE();
            this.flag4 = reader.readIntBE();

            /// image offsets
            for (let i = 0; i < imageCount; i++) {
                this.offsetTable[i] = reader.readIntBE();
            }
        }

        public toString(): string {
            return "pil: " + this.magic.toString(16) + "; "
                + this.flag1 + ", "
                + this.flag2 + ", "
                + this.flag3 + ", "
                + this.flag4.toString(16) + "  --  " + this.flag4.toString(2) + ", ";
        }
    }
}