import { BinaryReader } from '@/resources/file/binary-reader';
import { ChecksumCalculator } from '@/resources/file/checksum-calculator';
import { DecodeSettlers } from '@/resources/file/decode-settlers';
import { Decompress } from '@/resources/file/decompress';
import { MapChunkType } from './map-chunk-type';

/** provides information about a section in a map file */
export class MapChunk {
		public length = 0;
		public offset = 0;

		public chunkType = MapChunkType.UnknownType;
		public unpackedLength = 0;
		public checksum = 0;
		public unknown1 = 0;
		public unknown2 = 0;

		private reader?: BinaryReader;

		public get chunkTypeAsString(): string {
			return MapChunkType[this.chunkType] ?? '';
		}

		public getReader() : BinaryReader {
			if (!this.reader) {
				return new BinaryReader();
			}

			const c = new Decompress();
			return c.unpack(this.reader, this.offset, this.length, this.unpackedLength);
		}

		/** return the position of the next section header in the file */
		public calcNextChunkOffset():number {
			return this.offset + this.length;
		}

		public checkChecksum(): boolean {
			if (!this.reader) {
				return false;
			}

			const c1 = ChecksumCalculator.calc(this.reader, this.offset, this.length);
			return (c1 === this.checksum);
		}

		/** read the header of a section */
		public readFromFile(data: BinaryReader, offset:number):boolean {
			const SectionHeaderSize = 24;
			const plainData = DecodeSettlers.getReader(data, SectionHeaderSize, offset);

			if (plainData.length !== SectionHeaderSize) {
				return false;
			}

			this.reader = data;
			this.offset = SectionHeaderSize + offset;

			/// all sections have a type and a length... also the "end of file" section
			this.chunkType = plainData.readIntBE();
			this.length = plainData.readIntBE();

			if (this.chunkType === 0) {
				/// this is the "end of file" section
				return false;
			}

			this.unpackedLength = plainData.readIntBE();
			this.checksum = plainData.readIntBE();
			this.unknown1 = plainData.readIntBE();
			this.unknown2 = plainData.readIntBE();

			return true;
		}

		public toString(): string {
			return 'Chunk @ ' + this.offset + ', size: ' + this.unpackedLength + '; Type=' + this.chunkType + '; checksum=' +
				this.checksum + ', unknown1=' + this.unknown1 + ', unknown2=' + this.unknown2;
		}
}
