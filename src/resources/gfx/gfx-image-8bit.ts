import { BinaryReader } from '../file/binary-reader';
import { IGfxImage } from './igfx-image';

export class GfxImage8Bit implements IGfxImage {
    /** start of image data */
    public dataOffset = 0;

    /** width of the image */
    public width = 0;
    /** height of the image */
    public height = 0;

    public flag1 = 0;
    public flag2 = 0;

    private data: BinaryReader;

    private getImageData8Bit(buffer: Uint8Array, imgData: Uint8ClampedArray, pos: number, length: number) {
      let j = 0;
      while (j < length) {
        const value1 = buffer[pos];
        pos++;

        imgData[j++] = value1;// r
        imgData[j++] = value1; // g
        imgData[j++] = value1; // b
        imgData[j++] = 255; // alpha
      }
    }

    public getImageData(): ImageData {
      const img = new ImageData(this.width, this.height);
      const imgData = img.data;

      const buffer = this.data.getBuffer();
      const length = this.width * this.height;
      const pos = this.dataOffset;

      this.getImageData8Bit(buffer, imgData, pos, length);

      return img;
    }

    public getDataSize(): number {
      return this.width * this.height;
    }

    constructor(reader: BinaryReader) {
      this.data = reader;

      Object.seal(this);
    }

    public toString(): string {
      return 'size: (' + this.width + ' x' + this.height + ') ' +
            'data offset ' + this.dataOffset + '; ' +
            'flags: ' + this.flag1 + '  ' + this.flag2;
    }
}
