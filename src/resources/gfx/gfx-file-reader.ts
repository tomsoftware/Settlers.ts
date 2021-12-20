import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { DilFileReader } from './dil-file-reader';
import { GfxImage } from './gfx-image';
import { GilFileReader } from './gil-file-reader';
import { JilFileReader } from './jil-file-reader';
import { PaletteCollection } from './palette-collection';
import { ResourceFile } from './resource-file';

/** reads a .gfx file
 *        .gfx files contain images
 * */
export class GfxFileReader extends ResourceFile {
    private log: LogHandler = new LogHandler('GfxFileReader');
    private reader: BinaryReader;
    private gilFileReader: GilFileReader;
    private jilFileReader: JilFileReader | null;
    private dilFileReader: DilFileReader | null;
    private paletteCollection: PaletteCollection;

    // private images: GfxImage[] = []
    private isWordHeader = false;

    /** return the number of images in this gfx file */
    public getImageCount(): number {
        return this.gilFileReader.length;
    }

    /** return a Image by index */
    public getImage(index: number): GfxImage | null {
        if ((index < 0) || (index >= this.gilFileReader.length)) {
            this.log.error('Image Index out of range: ' + index);
            return null;
        }

        const gfxOffset = this.gilFileReader.getImageOffset(index);

        let jobIndex = index;
        /// if we use a jil file or not?
        if (this.dilFileReader && this.jilFileReader) {
            const dirOffset = this.dilFileReader.reverseLookupOffset(index);
            jobIndex = this.jilFileReader.reverseLookupOffset(dirOffset);

            if (jobIndex === -1) {
                this.log.error('unable to resolve job Index: ' + index);
                return null;
            }
        }

        return this.readImage(
            gfxOffset,
            jobIndex);
    }

    constructor(
        reader: BinaryReader,
        gilFileReader: GilFileReader,
        jilFileReader: JilFileReader | null,
        dilFileReader: DilFileReader | null,
        paletteCollection: PaletteCollection) {
        super();

        this.reader = reader;
        this.gilFileReader = gilFileReader;
        this.jilFileReader = jilFileReader;
        this.dilFileReader = dilFileReader;
        this.paletteCollection = paletteCollection;

        super.readResource(reader);

        Object.seal(this);
    }

    public readImage(offset: number, platteIndex: number): GfxImage {
        const reader = this.reader;
        const platte = this.paletteCollection.getPalette();
        const paletteOffset = this.paletteCollection.getOffset(platteIndex);

        reader.setOffset(offset);

        const imgHeadType = reader.readWordBE();

        reader.setOffset(offset);

        const newImg = new GfxImage(reader, platte, paletteOffset);

        if (imgHeadType > 860) {
            this.isWordHeader = true;

            newImg.headType = true;
            newImg.width = reader.readByte();
            newImg.height = reader.readByte();
            newImg.left = reader.readByte();
            newImg.top = reader.readByte();

            newImg.imgType = 0;

            newImg.flag1 = reader.readWordBE();
            newImg.flag2 = reader.readWordBE();

            newImg.dataOffset = offset + 8;
        } else {
            this.isWordHeader = false;

            newImg.headType = false;
            newImg.width = reader.readWordBE();
            newImg.height = reader.readWordBE();
            newImg.left = reader.readWordBE();
            newImg.top = reader.readWordBE();

            newImg.imgType = reader.readByte();

            newImg.flag1 = reader.readByte();
            newImg.flag2 = reader.readIntBE(2);

            newImg.dataOffset = offset + 12;
        }

        return newImg;
    }

    public toString() : string {
        return 'gfx: ' + super.toString() + ', --- ' + this.isWordHeader;
    }
}
