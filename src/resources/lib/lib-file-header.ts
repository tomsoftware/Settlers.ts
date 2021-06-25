import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { LibFileItem } from './lib-file-item';
import { PathList } from './path-list';

/** header of a lib file */
export class LibFileHeader {
		private log: LogHandler = new LogHandler('LibFileHeader');

		private reader: BinaryReader;

		public headerOffset = 0;
		public length = 0;
		public unknown = 0;

		public pathNameListOffset = 0;
		public pathNameListLength = 0;
		public pathNameCount = 0;

		public fileNameListOffset = 0;
		public fileNameListLength = 0;
		public fileNameCount = 0;

		public fileInfoOffset = 0;

		private pathList: PathList | null = null;

		constructor(data: BinaryReader, offset: number) {
			this.reader = new BinaryReader(data);

			if (!this.readHeader(this.reader, offset)) {

			}

			Object.seal(this);
		}

		public getPathList(): PathList {
			if (!this.pathList) {
				this.pathList = new PathList(this.readFileNames(this.reader, this.pathNameListOffset, this.pathNameCount));
			}

			return this.pathList;
		}

		public getFileInfo(): LibFileItem[] {
			const count = this.fileNameCount;

			const result = new Array<LibFileItem>(count);

			const fileNames = this.readFileNames(this.reader, this.fileNameListOffset, this.fileNameCount);

			this.reader.setOffset(this.fileInfoOffset);

			const pathNames = this.getPathList();

			for (let i = 0; i < count; i++) {
				result[i] = new LibFileItem();
				result[i].read(this.reader, fileNames[i], pathNames);
			}

			return result;
		}

		private readHeader(data: BinaryReader, offset: number): boolean {
			const HeaderSize = 6 * 4;

			if ((offset < 0) || (data.length < offset + HeaderSize)) {
				this.log.error('Unable to process LibFileHeader of ' + data.filename + ' - wrong offset');
				return false;
			}

			data.setOffset(offset);
			this.headerOffset = offset;

			this.length = data.readIntBE();
			this.unknown = data.readIntBE();
			this.pathNameListLength = data.readIntBE();
			this.pathNameCount = data.readIntBE();
			this.fileNameListLength = data.readIntBE();
			this.fileNameCount = data.readIntBE();

			this.pathNameListOffset = this.headerOffset + HeaderSize;
			this.fileNameListOffset = this.pathNameListOffset + this.pathNameListLength;
			this.fileInfoOffset = this.fileNameListOffset + this.fileNameListLength;

			return true;
		}

		private readFileNames(data: BinaryReader, offset: number, count: number): string[] {
			if (count <= 0) {
				return new Array<string>(0);
			}

			data.setOffset(offset);

			const list = new Array<string>(count);

			for (let i = 0; i < count; i++) {
				list[i] = data.readNullString();
			}

			return list;
		}

		public toString(): string {
			return 'Files: ' + this.fileNameCount + '; Paths:' + this.pathNameCount;
		}
}
