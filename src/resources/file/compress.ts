import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from './binary-reader';
import { BitWriter } from './bit-writer';
import { IndexValueTable, Packer, SymbolDirectory } from './packer';

/**
 *    Lz + Huffman compressing
 *    source: https://bitbucket.org/AngryKirC/noxedit2014/src/master/Shared/Kirc/NoxLzCompression.cs
*/
export class Compression extends Packer {
    private static log: LogHandler = new LogHandler('Compression');

    // LZ77 history window length (64KB)
    static WINDOW_SIZE = 65536;

    //  Compressor will rebuild symbol alphabet after this #of symbols
    static REBUILD_COUNTER = 8192 + 1;

    private find(src: Uint8Array, srcLen: number, outPos: number) {
        if (outPos + 4 >= srcLen) {
            // ignore left-length data smaller than 4
            return {
                matchLen: 0,
                offset: 0
            };
        }

        // Scan LZ window for at least 4 bytes matching these from src
        let back = outPos - (Compression.WINDOW_SIZE / 3); // offset back to some position (less = faster)
        if (back < 0) {
            back = 0; // start index cannot be negative
        }

        // scan from beginning of window till the current position
        let maxLength = 0;
        let maxOffset = 0;

        const bufferView = new DataView(src.buffer);
        const firstMatch = bufferView.getInt32(outPos);

        for (; back < outPos; back++) {
            // determine if matching sequence by comparing the first 4byte chunk
            if (bufferView.getInt32(back) !== firstMatch) {
                continue;
            }

            // find the length ot the matching sequence
            let matchLen = 4;
            while (src[back + matchLen] === src[outPos + matchLen]) {
                if ((outPos + matchLen + 1) >= srcLen) {
                    break; // boundary chk
                }
                matchLen += 1;
            }
            if (matchLen >= maxLength) {
                if (matchLen >= 517) {
                    // this is the maximum of bytes that can be copied
                    return {
                        matchLen: 517,
                        offset: back
                    };
                }

                maxLength = matchLen;
                maxOffset = back;
            }
        }

        return {
            matchLen: maxLength,
            offset: maxOffset
        };
    }

    private writeSymbol(symbol: number, charCodeTable: SymbolDirectory, bitWriter: BitWriter, huffmanTable: IndexValueTable) {
        // increment symbol counter
        charCodeTable.inc(symbol);
        // Search for that symbol in the Huffman alphabet
        const huffmanPos = charCodeTable.findIndex(symbol);

        let refOff = 0;
        let tabPos = 0;

        // Encode symbol reference
        // we want to have this encoded in less #of bits
        for (tabPos = 0; tabPos < 16; tabPos++) {
            // maximum value that can be represented directly by #bits
            const refLen = (1 << huffmanTable.index[tabPos]) - 1;
            // this val is added to the offset
            refOff = huffmanTable.value[tabPos];
            // check if offset is less than pos itself
            if (huffmanPos >= refOff) {
                // enough bits to represent remaining part of the offset
                if (refLen >= (huffmanPos - refOff)) {
                    break;
                }
                // if not then lookup next entry
            } else {
                Compression.log.error('Unable to find correct alphabet reference');
                return new BinaryReader();
            }
        }

        // position of symbol in alphabet minus table offset
        const remain = huffmanPos - refOff;
        // write encoded symbol
        bitWriter.write(tabPos, 4);
        bitWriter.write(remain, huffmanTable.index[tabPos]);
    }

    public pack(src: Uint8Array, srcLen: number): BinaryReader {
        let rebuild: number = Compression.REBUILD_COUNTER;
        let tabPos: number;
        let refLen: number;
        let outPos = 0;
        const bitWriter = new BitWriter();
        const huffmanTable = Packer.DefaultHuffmanTable;
        const charCodeTable = Packer.createSymbolDirectory();

        while ((outPos < srcLen)) {
            rebuild--;

            if ((rebuild < 0)) {
                //  Rebuild symbol alphabet
                //  so that more frequent symbols will be on top and will take less bits to encode
                this.writeSymbol(0x110, charCodeTable, bitWriter, huffmanTable);
                rebuild = Compression.REBUILD_COUNTER;

                // Rebuild symbol alphabet
                charCodeTable.generateCodes();

                // TODO actually *REBUILD* symbol indexer according to symbol usage frequency
                // For now just output default table
                for (let i = 0; i < 16; i += 1) {
                    let back = huffmanTable.index[i];
                    if (i >= 1) {
                        back -= huffmanTable.index[i - 1];
                    }
                    while (back > 0) {
                        back--;
                        bitWriter.write(0, 1);
                    }
                    bitWriter.write(1, 1);
                }

                continue;
            }

            const findResult = this.find(src, srcLen, outPos);
            const matchLen = findResult.matchLen;
            const back = findResult.offset;

            if (matchLen < 4) {
                // Literal symbol (plain byte)
                this.writeSymbol(src[outPos], charCodeTable, bitWriter, huffmanTable);
                outPos++;
                continue;
            }

            // Proceed on LZ logic
            // Encode length into symbol
            // 7+4 max
            if (matchLen <= 11) {
                // length = symbol - 0x100 + 4
                this.writeSymbol(0x100 + matchLen - 4, charCodeTable, bitWriter, huffmanTable);
            } else {
                // else use length table
                for (tabPos = 0; tabPos < 8; tabPos++) {
                    // maximum offset value that can be represented by using this table entry
                    refLen = Packer.LengthTable.value[tabPos] + (1 << Packer.LengthTable.index[tabPos]) - 1;
                    if ((matchLen - 4) <= refLen) {
                        break;
                    }
                }
                this.writeSymbol(0x108 + tabPos, charCodeTable, bitWriter, huffmanTable);

                // write entry index and offset
                bitWriter.write(matchLen - Packer.LengthTable.value[tabPos] - 4, Packer.LengthTable.index[tabPos]);
            }

            // if there was an application of LZ77
            const wndoff = outPos - back;
            outPos += matchLen;

            // encode DISTANCE_TABLE
            for (tabPos = 0; tabPos < 8; tabPos++) {
                // maximum offset value that can be represented by using this table entry
                refLen = (Packer.DistanceTable.value[tabPos] << 9) + (1 << (9 + Packer.DistanceTable.index[tabPos])) - 1;
                if (wndoff <= refLen) {
                    break;
                }
            }

            // write code
            bitWriter.write(tabPos, 3);
            bitWriter.write(wndoff - (Packer.DistanceTable.value[tabPos] << 9), Packer.DistanceTable.index[tabPos] + 9);
        }

        // write end of data
        this.writeSymbol(0x111, charCodeTable, bitWriter, huffmanTable);

        // close stream, return contents
        return bitWriter.toReader();
    }

    public static compress(src: BinaryReader): BinaryReader {
        const nxz = new Compression();
        const buf = src.getBuffer();
        return nxz.pack(buf, buf.length);
    }
}
