import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { DilFileReader } from './dil-file-reader';
import { GfxImage } from './gfx-image';
import { GilFileReader } from './gil-file-reader';
import { JilFileReader } from './jil-file-reader';
import { Palette } from './palette';
import { PaletteCollection } from './palette-collection';
import { ResourceFile } from './resource-file';

/** reads a .gfx file
 *    .gfx files contain images
 * */
export class GfxFileReader extends ResourceFile {
    private log: LogHandler = new LogHandler('GfxFileReader');
    private images: GfxImage[] = []
    private isWordHeader = false;

    /** return the number of images in this gfx file */
    public getImageCount(): number {
      return this.images ? this.images.length : 0;
    }

    /** return a Image by index */
    public getImage(index: number): GfxImage | null {
      if ((index < 0) || (index >= this.images.length)) {
        this.log.error('Image Index out of range: ' + index);
        return null;
      }
      return this.images[index];
    }

    constructor(
      reader: BinaryReader,
      offsetTable: GilFileReader,
      jobIndexList: JilFileReader | null,
      directionIndexList: DilFileReader | null,
      paletteCollection: PaletteCollection) {
      super();

      super.readResource(reader);

      const count = offsetTable.getImageCount();
      this.images = new Array<GfxImage>(count);

      let lastGood = 0;
      for (let i = 0; i < count; i++) {
        const gfxOffset = offsetTable.getImageOffset(i);

        let jobIndex = i;
        /// if we use a jil file or not?
        if (directionIndexList && jobIndexList) {
          const dirOffset = directionIndexList.reverseLookupOffset(i);
          jobIndex = jobIndexList.reverseLookupOffset(dirOffset);
          jobIndex = jobIndex === -1 ? lastGood : jobIndex;
          lastGood = jobIndex;
        }

        this.images[i] = this.readImage(
          reader,
          gfxOffset,
          paletteCollection.getPalette(),
          paletteCollection.getOffset(jobIndex));
      }

      Object.seal(this);
    }

    private readImage(reader: BinaryReader, offset: number, platte: Palette, paletteOffset: number): GfxImage {
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
      return 'gfx: ' + super.toString() + ', --- ' +
            this.isWordHeader;
    }
}
