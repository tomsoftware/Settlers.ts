import { BinaryReader } from '../file/binary-reader';
import { ChecksumCalculator } from '../file/checksum-calculator';
import { Decompress } from '../file/decompress';
import { PathList } from './path-list';

/** Information about one file in the lib */
export class LibFileItem {
        public fileName = '';

        public offset = 0;

        public length = 0;
        public decompressedLength = 0;

        public pathIndex = 0;
        public unknown = 0;

        public isCompressed = false;
        public checksum = 0;

        private reader: BinaryReader | null = null;
        private pathName = '';

        constructor() {
          Object.seal(this);
        }

        /** read this item from BinaryReader */
        public read(data: BinaryReader, fileName: string, pathNames: PathList): boolean {
          this.reader = new BinaryReader(data);

          this.fileName = fileName;

          this.offset = data.readIntBE();
          this.length = data.readIntBE();
          this.decompressedLength = data.readIntBE();
          this.pathIndex = data.readWordBE();
          this.unknown = data.readWordBE();
          this.isCompressed = data.readIntBE() === 1;
          this.checksum = data.readIntBE();

          this.pathName = pathNames.getPath(this.pathIndex);

          return (!data.eof());
        }

        /** return the full "path+file name of this file */
        public getFullName(): string {
          return this.pathName + '/' + this.fileName;
        }

        public checkChecksum(): boolean {
          if (!this.reader) {
            return false;
          }

          const c1 = ChecksumCalculator.calc(this.reader, this.offset, this.length);
          return (c1 === this.checksum);
        }

        /** return the data reader for a given filename */
        public getReader(): BinaryReader {
          if (!this.reader) {
            return new BinaryReader();
          }

          const fullName = this.reader.filename + '/' + this.getFullName();

          if (!this.isCompressed) {
            return new BinaryReader(this.reader, this.offset, this.length, fullName);
          } else {
            const decompress = new Decompress();
            const reader = decompress.unpack(this.reader, this.offset, this.length, this.decompressedLength);
            reader.filename = fullName;

            return reader;
          }
        }

        public toString(): string {
          return 'Name: ' + this.getFullName() + ';  PathId: ' + this.pathIndex + ';  Offset: ' + this.offset +
                ';  Length: ' + this.length + ';  DecompressedLength: ' + this.decompressedLength +
                ';  isCompressed: ' + this.isCompressed + ';  Checksum: ' + this.checksum + ';  Unknown: ' + this.unknown;
        }
}
