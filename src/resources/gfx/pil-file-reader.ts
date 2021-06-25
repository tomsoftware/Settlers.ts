import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { ResourceFile } from './resource-file';

/** interprets a .pil file -
		 *	pil may stand for: "palette index list" file"
		 *	it is a list of file indexes used to read a .pa5 or .pa6 file
		 * */
export class PilFileReader extends ResourceFile {
				private log: LogHandler = new LogHandler('PilFileReader');

				private offsetTable: Int32Array;

				public getOffset(gfxImageIndex: number): number {
					return this.offsetTable[gfxImageIndex];
				}

				constructor(resourceReader: BinaryReader) {
					super();

					const reader = this.readResource(resourceReader);

					/// read the palette offsets
					const imageCount = reader.length / 4;
					this.log.debug('image count ' + imageCount);

					this.offsetTable = new Int32Array(imageCount);

					for (let i = 0; i < imageCount; i++) {
						this.offsetTable[i] = reader.readIntBE();
					}

					Object.seal(this);
				}

				public toString(): string {
					return 'pil: ' + super.toString();
				}
}
