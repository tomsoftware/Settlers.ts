
/**
 * 101100000000010000000000000001
10110000000000

1     00000001
0     00000000
1     00000001
44    00101100 ---> chunk count

162
66
34
67

17186 - 17058 = 128
 *
 */

import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { GfxImage16Bit } from './gfx-image-16bit';
import { GfxImageWithPalette } from './gfx-image-with-palette';
import { IGfxImage } from './igfx-image';
import { ImageType } from './image-type';

/** interprets a .gh5 and .gh6 file -
         *    files contain background images
         * */
export class GhFileReader {
    private log: LogHandler = new LogHandler('GhFileReader');
    private images: IGfxImage[] = [];

    /** may this is the file version or a magic indicator for this
     * file type: 0x03 0x80 */
    private magic = 0;
    private flag1 = 0
    private flag2 = 0
    private flag3 = 0
    private flag4 = 0

    /** return the number of images in this gfx file */
    public getImageCount() :number {
        return this.images ? this.images.length : 0;
    }

    /** return a Image by index */
    public getImage(index:number) : IGfxImage | null {
        if ((index < 0) || (index >= this.images.length)) {
            this.log.error('Image Index out of range: ' + index);
            return null;
        }
        return this.images[index];
    }

    constructor(reader: BinaryReader) {
        const HeaderSize = 5 * 4;

        if (reader.length < HeaderSize) {
            this.log.error('wrong file size');
            return;
        }

        this.log.debug('read ' + reader.filename);

        /// file header
        this.magic = reader.readIntBE();
        this.flag1 = reader.readIntBE();
        this.flag2 = reader.readIntBE();
        this.flag3 = reader.readIntBE();
        this.flag4 = reader.readIntBE();

        let filePos = reader.getOffset();

        this.images = new Array<IGfxImage>();

        let size = -1;

        /// image offsets
        while (size !== 0) {
            reader.setOffset(filePos);

            const imageType = reader.readByte();
            const flag1 = reader.readByte();
            const flag2 = reader.readByte();
            const rowCount = reader.readByte();
            size = reader.readIntBE();

            let img:IGfxImage;

            switch (imageType) {
            case 0:
                img = new GfxImage16Bit(reader, 128, rowCount);
                break;
            case 1:
                img = new GfxImage16Bit(reader, 256, rowCount);
                break;
            case 2:
                img = new GfxImageWithPalette(reader, 128, rowCount);
                break;
            case 3:
                img = new GfxImageWithPalette(reader, 256, rowCount);
                break;
            default:
                return;
            }

            img.flag1 = flag1;
            img.flag2 = flag2;
            img.dataOffset = filePos + 8;

            this.images.push(img);

            this.log.debug('Found:' + img.toString());

            filePos += size + 8;
        }

        Object.seal(this);
    }

    /** return the image of a given type */
    public findImageByType<T>(type: ImageType): T | undefined {
        return this.images.find((i) => i.imageType === type) as T | undefined;
    }

    /** return a debug text-string */
    public toString():string {
        return 'gh: ' + this.magic.toString(16) + '; ' +
                    this.flag1 + ', ' +
                    this.flag2 + ', ' +
                    this.flag3 + ', ' +
                    this.flag4.toString(16) + '    --    ' + this.flag4.toString(2) + ', ';
    }
}
