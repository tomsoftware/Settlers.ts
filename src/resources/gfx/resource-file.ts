module Settlers {

    export class ResourceFile {

        /** may this is the file version or a magic indicator for this
         * file type: 0x03 0x80 */
        private magic: number;
        private flag1: number;
        private flag2: number;
        private flag3: number;
        private flag4: number;

        protected get headerSize() {
            return 20;
        }

        /** read the resource file header and return the payload */
        protected readResource(reader: BinaryReader) : BinaryReader {

            if (reader.length < this.headerSize) {
                new LogHandler("ResourceFile").log("wrong file size");
                return;
            }

            /// file header
            this.magic = reader.readIntBE();
            this.flag1 = reader.readIntBE();
            this.flag2 = reader.readIntBE();
            this.flag3 = reader.readIntBE();
            this.flag4 = reader.readIntBE();

            return new BinaryReader(reader, this.headerSize);
        }

     

        public toString(): string {
            return "header: " + this.magic.toString(16) + "; "
                + this.flag1 + ", "
                + this.flag2 + ", "
                + this.flag3 + ", "
                + this.flag4.toString(16) + "  --  " + this.flag4.toString(2) + ", ";
        }
    }
}