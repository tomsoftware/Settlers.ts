import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from './binary-reader';
import { BitReader } from './bit-reader';
import { StreamWriter } from './stream-writer';

class ValueBase {
	public length: Int32Array;
	public value: Int32Array;

	constructor(length: number) {
		this.value = new Int32Array(length);
		this.length = new Int32Array(length);
	}
}

/**
 *	Lz + Huffman compressing
 *	see also: https://bitbucket.org/AngryKirC/noxedit2014/src/master/Shared/Kirc/NoxLzCompression.cs
*/
export class Decompress {
	private log: LogHandler = new LogHandler('Decompress');

	private tab0 = new ValueBase(8);
	private tab1 = new ValueBase(8);

	constructor() {
		this.initTables();

		Object.seal(this);
	}

	public unpack(inDataSrc: BinaryReader, inOffset: number, inLength: number, outLength: number): BinaryReader {
		const inDate = new BitReader(inDataSrc, inOffset, inLength);

		const writer = new StreamWriter(outLength);

		const huffmanTable = this.initHuffmanTable();
		const codeQuantities = new Uint32Array(274);

		let done = false;

		const codeTable = this.initCharCodeTable();

		while ((inDate.getBufferLength() >= 4) || (!inDate.eof())) {
			// -------
			// - read code type
			const codeType = inDate.read(4);

			if (codeType < 0) {
				this.log.error('CodeType == 0 -> out of sync!');
				break;
			}

			// -------
			// - read Code Word
			let codeWord = 0;
			const codeWordLength = huffmanTable.length[codeType];
			let codeWordIndex = huffmanTable.value[codeType];

			if (codeWordLength > 0) {
				// - the codeword is bigger then 4 bits -> read more!
				codeWordIndex += inDate.read(codeWordLength);

				if (codeWordIndex >= 274) {
					this.log.error('CodeType >= 274 -> out of sync!');
					break;
				}
			}

			codeWord = codeTable[codeWordIndex];

			// -------
			// - Histogram of code using
			codeQuantities[codeWord]++;

			// -------
			// - execute codeword
			if (codeWord < 256) {
				if (writer.eof()) {
					this.log.error('OutBuffer is to small!');
					break;
				}

				// - this is a normal letter
				writer.setByte(codeWord);
			} else if (codeWord === 272) {
				// - create new entropy encoding table
				this.createCodeTableFromQuantities(codeTable, codeQuantities);

				let base = 0;
				let length = 0;

				for (let i = 0; i < 16; i++) {
					length--;

					let bitValue = 0;
					do {
						length++;
						bitValue = inDate.read(1);
					} while (bitValue === 0);

					huffmanTable.value[i] = base;
					huffmanTable.length[i] = length;

					base += (1 << length);
				}
			} else if (codeWord === 273) {
				if (inDate.sourceLeftLength() > 2) {
					// - sometimes there is a end-of-stream (eos) codeword (Codeword == 273) if the out data is "too" long.
					if (writer.eof()) {
						this.log.error('End-of-stream but Data buffer is not empty (' + inDate.sourceLeftLength() + ' IN bytes left; ' + writer.getLeftSize() + ' i OUT bytes left)? Out of sync!');
						break;
					}

					// -	in this case we ignore this eos and read the next part
					inDate.resetBitBuffer();
				} else {
					if (!writer.eof()) {
						this.log.error('Done decompress (' + inDate.sourceLeftLength() + ' IN bytes left; ' + writer.getLeftSize() + ' OUT bytes left)!');
					}

					// - end of data indicator
					done = true;
					break;
				}
			} else {
				// - copy from dictionary
				if (!this.fromDictionary(inDate, writer, codeWord)) {
					break;
				}
			}
		}

		// - did an Error happen?
		if (!done) {
			this.log.error('Unexpected End of Data in ' + inDataSrc.filename);
		}

		// - create new Reader from Data and return it
		return writer.getReader();
	}

	private fromDictionary(inDate: BitReader, writer: StreamWriter, codeword: number): boolean {
		let entryLength:number;
		let bitValue:number;
		let copyOffset = 0;

		if (codeword < 264) {
			entryLength = codeword - 256;
		} else {
			const length = this.tab1.length[codeword - 264];

			const ReadInByte = inDate.read(length);

			if (ReadInByte < 0) {
				this.log.error('ReadInByte == 0 -> out of sync!');
				return false;
			}

			entryLength = this.tab1.value[codeword - 264] + ReadInByte;
		}

		bitValue = inDate.read(3);
		if (bitValue < 0) {
			this.log.error('bitValue < 0 -> out of sync!');
			return false;
		}

		const length = this.tab0.length[bitValue] + 1;
		const baseValue = this.tab0.value[bitValue];

		bitValue = inDate.read(8);
		copyOffset = bitValue << length;

		bitValue = inDate.read(length);
		if (bitValue < 0) {
			this.log.error('bit_value < 0 -> out of sync!');
			return false;
		}

		entryLength += 4;

		// - check if destination is big enough:
		if (writer.getWriteOffset() + entryLength > writer.getLength()) {
			this.log.error('buffer for outData is to small!');
			return false;
		}

		// - source position in buffer
		let srcPos = writer.getWriteOffset() - ((bitValue | copyOffset) + (baseValue << 9));

		// - we need to use single-byte-copy the data case, the src and dest can be overlapped
		for (let i = entryLength; i > 0; i--) {
			writer.setByte(writer.getByte(srcPos));
			srcPos++;
		}

		return true;
	}

	private initTables() {
		// -- tab0
		this.tab0.length[0] = 0;
		this.tab0.value[0] = 0;

		for (let i = 1; i < 8; i++) {
			this.tab0.length[i] = i - 1;
			this.tab0.value[i] = 1 << (i - 1);
		}

		// -- tab1
		for (let i = 0; i < 8; i++) {
			this.tab1.length[i] = i + 1;
			this.tab1.value[i] = (1 << (i + 1)) + 6;
		}
	}

	private createCodeTableFromQuantities(codes: Uint16Array, quantities: Uint32Array) {
		const tmpQuantity = new Uint32Array(274);

		for (let i = 0; i < 274; i++) {
			const count = quantities[i];

			// - create a snapshot of the quantities
			tmpQuantity[i] = count;
			codes[i] = i;

			// - we reduce the original quantity by 2 to the impact for the next CreateCodeTableFromFrequency() call
			quantities[i] = count / 2;
		}

		// - "sort" the tables
		this.sortCodeTable(codes, tmpQuantity, 274);
	}

	private sortCodeTable(codes: Uint16Array, quantities: Uint32Array, lenght: number) {
		let pos = 0;
		let delta = 0;
		let srcCode = 0;
		let srcQuantity = 0;
		let srcPos = 0;
		let stepSize = 40;

		do {
			for (let i = stepSize; i < lenght; i++) {
				srcCode = codes[i];
				srcQuantity = quantities[i];

				pos = i;

				while (pos >= stepSize) {
					srcPos = pos - stepSize;

					delta = quantities[srcPos] - srcQuantity;
					if (delta === 0) {
						delta = codes[srcPos] - srcCode;
					}

					if (delta >= 0) {
						break;
					}

					codes[pos] = codes[srcPos];
					quantities[pos] = quantities[srcPos];

					pos = pos - stepSize;
				}

				codes[pos] = srcCode;
				quantities[pos] = srcQuantity;
			}

			stepSize = Math.floor(stepSize / 3) | 0; // - use floor!
		} while (stepSize > 0);
	}

	private initHuffmanTable(): ValueBase {
		const table = new ValueBase(16);
		table.length = new Int32Array([0x2, 0x3, 0x3, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x5, 0x5, 0x5]);
		table.value = new Int32Array([0x0, 0x4, 0xC, 0x14, 0x24, 0x34, 0x44, 0x54, 0x64, 0x74, 0x84, 0x94, 0xA4, 0xB4, 0xD4, 0xF4]);

		return table;
	}

	private initCharCodeTable(): Uint16Array {
		return new Uint16Array([
			0x100, 0x101, 0x102, 0x103, 0x104, 0x105, 0x106, 0x107, 0x108, 0x109, 0x10A, 0x10B, 0x10C, 0x10D, 0x10E, 0x10F,
			0x0, 0x20, 0x30, 0xFF,
			0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xA, 0xB, 0xC, 0xD, 0xE, 0xF, 0x10,
			0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F,
			0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F,
			0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x3E, 0x3F, 0x40,
			0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x4B, 0x4C, 0x4D, 0x4E, 0x4F, 0x50,
			0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F, 0x60,
			0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70,
			0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x7B, 0x7C, 0x7D, 0x7E, 0x7F, 0x80,
			0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, 0x8E, 0x8F, 0x90,
			0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0x9B, 0x9C, 0x9D, 0x9E, 0x9F, 0xA0,
			0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF, 0xB0,
			0xB1, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xBB, 0xBC, 0xBD, 0xBE, 0xBF, 0xC0,
			0xC1, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xCB, 0xCC, 0xCD, 0xCE, 0xCF, 0xD0,
			0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xDB, 0xDC, 0xDD, 0xDE, 0xDF, 0xE0,
			0xE1, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xEB, 0xEC, 0xED, 0xEE, 0xEF, 0xF0,
			0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE,
			0x110, 0x111]);
	}
}
