/// <reference path="./resource-file.ts" />

module Settlers {
    /** read a pa6 file */
    export class PaletCollection extends ResourceFile {
        private log: LogHandler = new LogHandler("PaletCollection");
        private palette: Palette;
        private pilFile: PilFileReader;
        private paletteFileOffset: number;

        public getPalette() {
            return this.palette;
        }

        public getOffset(gfxImageIndex: number) {
            return (this.pilFile.getOffset(gfxImageIndex) - this.paletteFileOffset) / 2;
        }

        public constructor(pa6File: BinaryReader, pilFile: PilFileReader) {
            super();

            this.pilFile = pilFile;

            /// read file header
            const reader = super.readResource(pa6File);

            this.paletteFileOffset = super.headerSize;

            /// read all colors - every color is 2 byte long
            this.palette = new Palette(reader.length / 2);

            this.palette.read16BitPalette(reader, 0);
        }
    }
}