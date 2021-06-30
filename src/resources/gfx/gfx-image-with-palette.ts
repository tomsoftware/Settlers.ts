import { BinaryReader } from '../file/binary-reader';
import { IGfxImage } from './igfx-image';
import { ImageType } from './image-type';
import { Palette } from './palette';

/**
 * Image with the format:
 *     image1
 *     palette1
 *     image2
 *     palette2
 */
export class GfxImageWithPalette implements IGfxImage {
    public imageType = ImageType.ImagePalette;

    /** start of image data */
    public dataOffset = 0;

    /** width of the image */
    public width: number;
    /** height of the image */
    public height: number;

    /** every chunk height has it'S own palette */
    public chunkHeight: number;

    private data: BinaryReader;

    public flag1 = 0;
    public flag2 = 0;
    public rowCount = 0;

    private palette: Palette = new Palette();

    private getImageDataWithPalette(buffer: Uint8Array, imgData: Uint8ClampedArray, pos: number, length: number) {
        let j = 0;
        const p = this.palette;

        const i = new Uint32Array(imgData.buffer);
        const chunkLength = this.chunkHeight * this.width;
        let c = 0;

        pos -= 256 * 3;

        while (j < length) {
            if (c <= 0) {
                /// jump over palette data
                pos += 256 * 3;
                this.palette.read3BytePalette(buffer, pos + chunkLength);
                c = chunkLength;
            }
            c--;

            const index = buffer[pos++];

            i[j++] = p.getColor(index);
        }

        console.log('size : ' + (pos - this.dataOffset));
        console.log('left byte: ' + (buffer.length - pos));
    }

    public getDataSize(): number {
        return this.width * this.height +
                    Math.floor(this.height / this.chunkHeight) * 3 * 256;
    }

    public getImageData(): ImageData {
        const img = new ImageData(this.width, this.height);
        const imgData = img.data;

        const buffer = this.data.getBuffer();
        const length = this.width * this.height;
        const pos = this.dataOffset;

        this.getImageDataWithPalette(buffer, imgData, pos, length);

        return img;
    }

    constructor(reader: BinaryReader, width: number, chunkCount: number) {
        this.data = reader;
        this.chunkHeight = width;
        this.width = width;
        this.height = width * chunkCount;

        Object.seal(this);
    }

    public toString(): string {
        return ImageType[this.imageType] + ' - ' +
                    'size: (' + this.width + ' x ' + this.height + ') ' +
                    'data offset ' + this.dataOffset + ' ' +
                    'data size ' + this.getDataSize() + ' ' +
                    'rows: ' + this.rowCount + '; ' +
                    'chunkHeight: ' + this.chunkHeight + ' ' +
                    'flags: ' + this.flag1 + ' / ' + this.flag2;
    }
}
