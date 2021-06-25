import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';

export class ResourceFile {
		/** may this is the file version or a magic indicator for this
		 * file type: 0x03 0x80 */
		private magic = 0;
		private flag1 = 0;
		private flag2 = 0;
		private flag3 = 0;
		private flag4 = 0;

		protected get headerSize() : number {
			return 20;
		}

		/** read the resource file header and return the payload */
		protected readResource(reader: BinaryReader) : BinaryReader {
			if (reader.length < this.headerSize) {
				new LogHandler('ResourceFile').error('wrong file size');
				return new BinaryReader();
			}

			/// file header
			this.magic = reader.readIntBE();
			this.flag1 = reader.readIntBE();
			this.flag2 = reader.readIntBE();
			this.flag3 = reader.readIntBE();
			this.flag4 = reader.readIntBE();

			return new BinaryReader(reader, this.headerSize);
		}

		public toString(): string {
			return 'header: ' + this.magic.toString(16) + '; ' +
						this.flag1 + ', ' +
						this.flag2 + ', ' +
						this.flag3 + ', ' +
						this.flag4.toString(16) + '	--	' + this.flag4.toString(2) + ', ';
		}
}
