import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { IndexFile } from './index-file';

/** interprets a .gil file -
 *    gil may stand for: "graphic index list" file
 *    it contains the offsets for all frames in a .gfx file
 * */
export class GilFileReader extends IndexFile {
    private static log: LogHandler = new LogHandler('GilFileReader');

    /** return the number of images stored in the gfx file */
    public getImageCount():number {
        return this.offsetTable ? this.offsetTable.length : 0;
    }

    /** return the file offset of a gfx image */
    public getImageOffset(index: number): number {
        if ((index < 0) || (index >= this.offsetTable.length)) {
            GilFileReader.log.error('Gfx-Index out of range: ' + index);
            return -1;
        }
        return this.offsetTable[index];
    }

    constructor(resourceReader: BinaryReader) {
        super(resourceReader);

        GilFileReader.log.debug('image count ' + this.length + ' of ' + resourceReader.filename);

        Object.seal(this);
    }

    public toString(): string {
        return 'gil: ' + super.toString();
    }
}
