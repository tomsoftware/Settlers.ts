import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { Palette } from './palette';
import { PilFileReader } from './pil-file-reader';
import { ResourceFile } from './resource-file';

/** read a pa6 file */
export class PaletteCollection extends ResourceFile {
        private log: LogHandler = new LogHandler('PaletteCollection');
        private palette: Palette;
        private pilFile: PilFileReader;
        private paletteFileOffset: number;

        public getPalette():Palette {
            return this.palette;
        }

        public getOffset(gfxImageIndex: number):number {
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

            Object.seal(this);
        }
}
