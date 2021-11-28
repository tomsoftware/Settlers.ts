import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from './binary-reader';
import { BitReader } from './bit-reader';
import { IndexValueTable, Packer } from './packer';
import { StreamWriter } from './stream-writer';

/**
 *    Lz + Huffman decompressing
*/
export class Decompress extends Packer {
    private log: LogHandler = new LogHandler('Decompress');

    constructor() {
        super();
        Object.seal(this);
    }

    public unpack(inDataSrc: BinaryReader, inOffset: number, inLength: number, outLength: number): BinaryReader {
        const inDate = new BitReader(inDataSrc, inOffset, inLength);

        const writer = new StreamWriter(outLength);

        let huffmanTable = Packer.DefaultHuffmanTable;

        let done = false;

        const codeTable = Packer.createSymbolDirectory();

        while (!inDate.eof()) {
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
            const codeWordLength = huffmanTable.index[codeType];
            let codeWordIndex = huffmanTable.value[codeType];

            if (codeWordLength > 0) {
                // - the codeword is bigger then 4 bits -> read more!
                codeWordIndex += inDate.read(codeWordLength);

                if (codeWordIndex >= 274) {
                    this.log.error('CodeType(' + codeWordIndex + ') >= 274 -> out of sync!');
                    break;
                }
            }

            codeWord = codeTable.codeTable[codeWordIndex];

            // -------
            // - Histogram of code using
            codeTable.inc(codeWord);

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
                codeTable.generateCodes();

                const newIndex: number[] = [];
                const newValues: number[] = [];

                let base = 0;
                let length = 0;

                for (let i = 0; i < 16; i++) {
                    length--;

                    let bitValue = 0;
                    do {
                        length++;
                        bitValue = inDate.read(1);
                    } while (bitValue === 0);

                    newIndex.push(length);
                    newValues.push(base);

                    base += (1 << length);
                }

                huffmanTable = new IndexValueTable(newIndex, newValues);
            } else if (codeWord === 273) {
                if (inDate.sourceLeftLength() > 2) {
                    // - sometimes there is a end-of-stream (eos) codeword (Codeword == 273) if the out data is "too" long.
                    if (writer.eof()) {
                        this.log.error('End-of-stream but Data buffer is not empty (' + inDate.sourceLeftLength() + ' IN bytes left; ' + writer.getLeftSize() + ' i OUT bytes left)? Out of sync!');
                        break;
                    }

                    // -    in this case we ignore this eos and read the next part
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
                    this.log.error('bad dictionary entry!');
                    break;
                }
            }
        }

        // - did an Error happen?
        if (!done) {
            this.log.error('Unexpected End of Data in ' + inDataSrc.filename + ' eof: ' + inDate.toString());
        }

        // - create new Reader from Data and return it
        return writer.getReader();
    }

    private fromDictionary(inDate: BitReader, writer: StreamWriter, codeWord: number): boolean {
        let entryLength:number;
        let bitValue:number;
        let copyOffset = 0;

        if (codeWord < 264) {
            entryLength = codeWord - 256;
        } else {
            const length = Packer.LengthTable.index[codeWord - 264];

            const ReadInByte = inDate.read(length);

            if (ReadInByte < 0) {
                this.log.error('ReadInByte == 0 -> out of sync!');
                return false;
            }

            entryLength = Packer.LengthTable.value[codeWord - 264] + ReadInByte;
        }

        bitValue = inDate.read(3);
        if (bitValue < 0) {
            this.log.error('bitValue < 0 -> out of sync!');
            return false;
        }

        const length = Packer.DistanceTable.index[bitValue] + 1;
        const baseValue = Packer.DistanceTable.value[bitValue];

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
}
