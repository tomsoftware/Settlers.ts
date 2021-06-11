import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { ResourceFile } from './resource-file';

/** interprets a .dil file -
 *  dil may stand for: "direction index list" file
 *  it indicates the different object directions in a gil file
 *    jil (job)  --> .dil (direction)--> gil (frames) --> gfx
 * */
export class DilFileReader extends ResourceFile {
    private log: LogHandler = new LogHandler('DilFileReader');

    private offsetTable: Int32Array;

    /** find the index matching a given gil offset  */
    public reverseLookupOffset(gilIndex: number): number {
      const offsetTable = this.offsetTable;

      const offset = gilIndex * 4 + 20;

      let lastGood = 0;

      for (let i = 0; i < offsetTable.length; i++) {
        if (offsetTable[i] === 0) {
          continue;
        }

        if (offsetTable[i] > offset) {
          this.log.debug(gilIndex + ' --> ' + lastGood);
          return lastGood;
        }
        lastGood = i;
      }

      this.log.error('Unable to find offset gilIndex:' + gilIndex);
      return lastGood;
    }

    constructor(resourceReader: BinaryReader) {
      super();

      const reader = this.readResource(resourceReader);

      /// read the object offsets
      const imageCount = reader.length / 4;
      this.log.debug('object count ' + imageCount);

      this.offsetTable = new Int32Array(imageCount);

      for (let i = 0; i < imageCount; i++) {
        this.offsetTable[i] = reader.readIntBE();
      }

      Object.seal(this);
    }

    public toString(): string {
      return 'jil: ' + super.toString();
    }
}
