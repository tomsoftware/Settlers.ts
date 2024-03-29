import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { IndexFile } from './index-file';

/** interprets a .jil file -
 *    jil may stand for: "job index list" file
 *    it indicates the different jobs in a .dil file
 *        jil (job)    --> .dil (direction)--> gil (frames) --> gfx
 * */
export class JilFileReader extends IndexFile {
    private static log: LogHandler = new LogHandler('JilFileReader');

    /** find the index matching a given direction offset    */
    public reverseLookupOffset(dirOffset: number): number {
        const offsetTable = this.offsetTable;

        const offset = dirOffset * 4 + 20;

        for (let i = 0; i < offsetTable.length; i++) {
            if (offsetTable[i] === offset) {
                JilFileReader.log.debug(dirOffset + ' --> ' + i);
                return i;
            }
        }

        JilFileReader.log.error('Unable to find offset dirOffset: ' + dirOffset);
        return -1;
    }

    constructor(resourceReader: BinaryReader) {
        super(resourceReader);

        JilFileReader.log.debug('job count ' + this.length);

        Object.seal(this);
    }

    public toString(): string {
        return 'jil: ' + super.toString();
    }
}
