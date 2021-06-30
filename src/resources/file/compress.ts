import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from './binary-reader';
import { BitWriter } from './bit-writer';

export class Compression {
    private static log: LogHandler = new LogHandler('Compression');

    //  Constants
    ///  <summary>
    ///  Max number of Huffman encoded symbols
    ///  </summary>
    static SYMBOLS = 274;

    ///  <summary>
    ///  LZ77 history window length (64KB)
    ///  </summary>
    static WINDOW_SIZE = 65536;

    ///  <summary>
    ///  Compressor will rebuild symbol alphabet after this #of symbols
    ///  </summary>
    static REBUILD_COUNTER = 8192;

    ///  <summary>
    ///  LZ77 table indexing sequence length
    ///  </summary>
    static LENGTH_TABLE =
    [
        1, 0x008,
        2, 0x00A,
        3, 0x00E,
        4, 0x016,
        5, 0x026,
        6, 0x046,
        7, 0x086,
        8, 0x106
    ];

    ///  <summary>
    ///  LZ77 table indexing sequence offset in window
    ///  </summary>
    static DISTANCE_TABLE =
    [
        0, 0x00,
        0, 0x01,
        1, 0x02,
        2, 0x04,
        3, 0x08,
        4, 0x10,
        5, 0x20,
        6, 0x40
    ];

    //  Variables
    ///  <summary>
    ///  Huffman alphabet containing symbols sorted by their occurence rate
    ///  </summary>
    SymbolAlphabet = new Int32Array(Compression.SYMBOLS);

    //
    symbolIndexTable: Int32Array;

    ///  <summary>
    ///  Table addressing how many times each symbol occurs
    ///  </summary>
    SymbolCounter: Int32Array;

    private constructor() {
        this.symbolIndexTable = new Int32Array([
            0x00000002, 0x00000000,
            0x00000003, 0x00000004,
            0x00000003, 0x0000000C,
            0x00000004, 0x00000014,
            0x00000004, 0x00000024,
            0x00000004, 0x00000034,
            0x00000004, 0x00000044,
            0x00000004, 0x00000054,
            0x00000004, 0x00000064,
            0x00000004, 0x00000074,
            0x00000004, 0x00000084,
            0x00000004, 0x00000094,
            0x00000004, 0x000000A4,
            0x00000005, 0x000000B4,
            0x00000005, 0x000000D4,
            0x00000005, 0x000000F4
        ]);

        this.buildInitialAlphabet();
        //  init variables

        this.SymbolCounter = new Int32Array(Compression.SYMBOLS);
    }

    private buildInitialAlphabet() {
        const result: number[] = [];

        for (let i = 0; i <= 15; i++) {
            result.push(i + 0x100);
        }

        result.push(0);
        result.push(32);
        result.push(48);
        result.push(255);

        for (let i = 1; (i <= 273); i++) {
            if (result.findIndex((j) => j === i) < 0) {
                result.push(i);
            }
        }

        this.SymbolAlphabet = new Int32Array(result);
    }

    private RebuildAlphabet() {
        const huffman: number[] = new Array(Compression.SYMBOLS);
        for (let i = 0; i < Compression.SYMBOLS; i++) {
            huffman[i] = i;
        }

        huffman.sort((x1, x2) => ((this.SymbolCounter[x2] << 16) + x2) - ((this.SymbolCounter[x1] << 16) + x1));
        this.SymbolAlphabet = new Int32Array(huffman);
    }

    /*
    private DecompressImpl(dst: number[], dstLen: number): boolean {
        let distance: number;
        let code: number;
        let bits: number;
        let offset: number;
        let idx: number;
        let symbol: number;
        let length: number;
        while ((this.outPos < dstLen)) {
            code = this.bitrdr.Read(4);
            //  SHL one bit is analogical to multiplying by 2
            bits = this.SymbIndexTable[code << 1];
            offset = this.SymbIndexTable[(code << 1) + 1];
            //  position of the symbol in alphabet
            idx = (this.bitrdr.Read(bits) + offset);
            symbol = this.SymbolAlphabet[idx];
            this.SymbolCounter[symbol]++;

            if ((symbol < 0x100)) {
                //  Output literal (plain byte)
                dst[this.outPos] = symbol;
                this.outPos++;
                this.LZWindow[(this.LZPosWindow % Compression.WINDOW_SIZE)] = symbol;
                this.LZPosWindow++;
            }
            else if ((symbol === 0x110)) {
                //  Rebuild symbol alphabet
                this.RebuildAlphabet();
                //  Divide all counts by two
                let i: number = Compression.SYMBOLS;
                while ((i > 0)) {
                    i--;
                    this.SymbolCounter[i] = (this.SymbolCounter[i] >> 1);
                }

                //  Parse new Huffman table
                bits = 0;
                offset = 0;
                length = 0;
                i = 16;
                while ((i > 0)) {
                    i--;
                    while ((this.bitrdr.ReadBit() == 0)) {
                        bits++;
                    }

                    this.SymbIndexTable[length] = bits;
                    this.SymbIndexTable[(length + 1)] = offset;
                    length += 2;
                    offset += 1 << bits;
                }

            }
            else if (symbol >= 0x111) {
                return false; //  symbol out of range
            }
            else {
                //  LZ77
                //  find sequence length
                length = 4;
                if (symbol < 0x108) {
                    length += symbol - 0x100;
                }
                else {
                    idx = symbol - 0x108;
                    bits = Compression.LENGTH_TABLE[idx << 1];
                    offset = Compression.LENGTH_TABLE[(idx << 1) + 1];
                    length += offset + this.bitrdr.Read(bits);
                }

                // read window offset the sequence is located at
                code = this.bitrdr.Read(3);
                bits = Compression.DISTANCE_TABLE[code << 1];
                offset = Compression.DISTANCE_TABLE[(code << 1) + 1];
                distance = (offset << 9) + this.bitrdr.Read(bits + 9);

                idx = this.LZPosWindow - distance;
                // Copy sequence from history window
                for (let i = 0; (i < length); i++) {
                    symbol = this.LZWindow[(idx + i) % Compression.WINDOW_SIZE];

                    dst[this.outPos] = symbol; this.outPos++;

                    this.LZWindow[this.LZPosWindow % Compression.WINDOW_SIZE] = symbol;
                    this.LZPosWindow++;
                }

            }

        }

        return true;
    }
    */
    public pack(src: Uint8Array, srcLen: number): BinaryReader {
        let rebuild: number = Compression.REBUILD_COUNTER;
        let back = 0;
        let huffmanPos: number;
        let tabPos: number;
        let matchLen = 0;
        let refLen: number;
        let refOff = 0;
        let remain: number;
        let symbol: number;
        let seq: number;
        let outPos = 0;
        const bitwtr = new BitWriter();

        while ((outPos < srcLen)) {
            if ((rebuild < 0)) {
                //  Rebuild symbol alphabet
                //  so that more frequent symbols will be on top and will take less bits to encode
                symbol = 0x110;
                rebuild = Compression.REBUILD_COUNTER;
            } else {
                // Scan LZ window for at least 4 bytes matching these from src
                back = outPos - (Compression.WINDOW_SIZE / 2); // offset back to some position (less = faster)
                if (back < 0) {
                    back = 0; // index cannot be negative
                }
                // scan from beginning of window till the current position
                seq = src[outPos];
                // possible optimiziation: by scanning in reverse order one can achieve smaller window offsets (=less bits)
                while (back < outPos) {
                    matchLen = 0;
                    // determine length of matching sequence by comparing 4byte chunks
                    while (src[back + matchLen] === seq) {
                        if ((outPos + matchLen + 1) >= srcLen) {
                            break; // boundary chk
                        }
                        matchLen += 1;
                        seq = src[outPos + matchLen];
                    }
                    if (matchLen >= 4) {
                        break;
                    }
                    back += 1;
                }

                // quickfix: too large to encode
                if (matchLen >= 4 && matchLen <= 517) {
                    // Proceed on LZ logic
                    // Encode length into symbol
                    // 7+4 max
                    if (matchLen <= 11) {
                        // length = symbol - 0x100 + 4
                        symbol = 0x100 + (matchLen - 4);
                    } else {
                        // else use length table
                        for (tabPos = 0; tabPos < 8; tabPos++) {
                            // maximum offset value that can be represented by using this table entry
                            refLen = Compression.LENGTH_TABLE[(tabPos << 1) + 1] + (1 << (Compression.LENGTH_TABLE[tabPos << 1])) - 1;
                            if ((matchLen - 4) <= refLen) break;
                        }
                        symbol = 0x108 + tabPos;
                    }
                    // proceed - write symbol and then encode
                } else {
                    // Literal symbol (plain byte)
                    symbol = src[outPos];
                    outPos++;
                }
            }
            rebuild--;

            // increment symbol counter
            this.SymbolCounter[symbol]++;
            // Search for that symbol in the Huffman alphabet
            huffmanPos = 0;
            while (huffmanPos <= Compression.SYMBOLS) {
                if (this.SymbolAlphabet[huffmanPos] === symbol) break; // Found
                huffmanPos++;
            }
            // Encode symbol reference
            // we want to have this encoded in less #of bits
            for (tabPos = 0; tabPos < 16; tabPos++) {
                // maximum value that can be represented directly by #bits
                refLen = (1 << this.symbolIndexTable[tabPos << 1]) - 1;
                // this val is added to the offset
                refOff = this.symbolIndexTable[(tabPos << 1) + 1];
                // check if offset is less than pos itself
                if (huffmanPos >= refOff) {
                    // enough bits to represent remaining part of the offset
                    if (refLen >= (huffmanPos - refOff)) break;
                    // if not then lookup next entry
                } else {
                    Compression.log.error('Unable to find correct alphabet reference');
                    return new BinaryReader();
                }
            }
            // position of symbol in alphabet minus table offset
            remain = huffmanPos - refOff;
            // write encoded symbol
            bitwtr.write(tabPos, 4);
            bitwtr.write(remain, this.symbolIndexTable[tabPos << 1]);

            if (symbol === 0x110) {
                // Rebuild symbol alphabet
                this.RebuildAlphabet();
                // Divide all counts by two
                let i = Compression.SYMBOLS;
                while (i > 0) {
                    i--;
                    this.SymbolCounter[i] = this.SymbolCounter[i] >> 1;
                }

                // TODO actually *REBUILD* symbol indexer according to symbol usage frequency
                // For now just output default table
                for (let i = 0; i < 32; i += 2) {
                    back = this.symbolIndexTable[i];
                    if (i >= 2) back -= this.symbolIndexTable[i - 2];
                    while (back > 0) {
                        back--;
                        bitwtr.write(0, 1);
                    }
                    bitwtr.write(1, 1);
                }
            } else if (symbol >= 0x100) {
                // if there was an application of LZ77
                const wndoff = outPos - back;
                outPos += matchLen;

                // if length table was used, write entry index and offset
                if (symbol >= 0x108) { bitwtr.write(matchLen - Compression.LENGTH_TABLE[((symbol - 0x108) << 1) + 1] - 4, Compression.LENGTH_TABLE[(symbol - 0x108) << 1]) }

                // encode DISTANCE_TABLE
                for (tabPos = 0; tabPos < 8; tabPos++) {
                    // maximum offset value that can be represented by using this table entry
                    refLen = ((Compression.DISTANCE_TABLE[(tabPos << 1) + 1]) << 9) + (1 << (9 + Compression.DISTANCE_TABLE[tabPos << 1])) - 1;
                    if (wndoff <= refLen) break;
                }

                // write code
                bitwtr.write(tabPos, 3);
                // distance = (TableVal2 << 9) + bitrdr.Read(TableVal1 + 9)
                bitwtr.write(wndoff - (Compression.DISTANCE_TABLE[(tabPos << 1) + 1] << 9), Compression.DISTANCE_TABLE[tabPos << 1] + 9);
            }
        }

        // close stream, return contents
        return bitwtr.toReader();
    }

    /*
    public static Decompress(src: Int8Array, dst: number[]): boolean {
        let nxz: NoxLzCompression = new NoxLzCompression();
        nxz.BuildInitialAlphabet();
        //  initialize required variables
        nxz.bitrdr = new BitReader(src);
        nxz.LZWindow = new Array(WINDOW_SIZE);
        nxz.LZPosWindow = 0;
        nxz.SymbolCounter = new Array(SYMBOLS);
        nxz.outPos = 0;
        return nxz.DecompressImpl(dst, dst.Length);
    }
    */
    public static compress(src: BinaryReader): BinaryReader {
        const nxz = new Compression();
        const buf = src.getBuffer();
        return nxz.pack(buf, buf.length);
    }
}
