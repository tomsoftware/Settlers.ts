import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { IndexFile } from './index-file';

/** interprets a .dil file -
 *    dil may stand for: "direction index list" file
 *    it indicates the different object directions in a gil file
 *        jil (job)    --> .dil (direction)--> gil (frames) --> gfx
 * */
export class DilFileReader extends IndexFile {
    private static log: LogHandler = new LogHandler('DilFileReader');

    /** find the index matching a given gil offset */
    public reverseLookupOffset(gilIndex: number): number {
        const offsetTable = this.offsetTable;

        const offset = gilIndex * 4 + 20;

        let lastGood = 0;

        for (let i = 0; i < offsetTable.length; i++) {
            if (offsetTable[i] === 0) {
                continue;
            }

            if (offsetTable[i] > offset) {
                DilFileReader.log.debug(gilIndex + ' --> ' + lastGood);
                return lastGood;
            }
            lastGood = i;
        }

        DilFileReader.log.error('Unable to find offset gilIndex:' + gilIndex);
        return lastGood;
    }

    constructor(resourceReader: BinaryReader) {
        super(resourceReader);

        DilFileReader.log.debug('object count ' + resourceReader.length);

        Object.seal(this);
    }

    public toString(): string {
        return 'jil: ' + super.toString();
    }
}
