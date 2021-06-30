import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { ResourceFile } from './resource-file';

/** interprets a .gil file -
         *    gil may stand for: "graphic index list" file
         *    it contains the offsets for all frames in a .gfx file
         * */
export class GilFileReader extends ResourceFile {
                private log: LogHandler = new LogHandler('GilFileReader');

                private offsetTable: Int32Array;

                /** return the number of images stored in the gfx file */
                public getImageCount():number {
                    return this.offsetTable ? this.offsetTable.length : 0;
                }

                /** return the file offset of a gfx image */
                public getImageOffset(index: number): number {
                    if ((index < 0) || (index >= this.offsetTable.length)) {
                        this.log.error('Gfx-Index out of range: ' + index);
                        return -1;
                    }
                    return this.offsetTable[index];
                }

                constructor(resourceReader: BinaryReader) {
                    super();

                    const reader = super.readResource(resourceReader);

                    const imageCount = reader.length / 4;
                    this.log.debug('image count ' + imageCount + ' of ' + resourceReader.filename + '    with size ' + reader.length);

                    this.offsetTable = new Int32Array(imageCount);

                    /// image offsets
                    for (let i = 0; i < imageCount; i++) {
                        this.offsetTable[i] = reader.readIntBE();
                    }

                    Object.seal(this);
                }

                public toString(): string {
                    return 'gil: ' + super.toString();
                }
}
