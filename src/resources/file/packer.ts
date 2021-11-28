export class IndexValueTable {
    public index: Int32Array;
    public value: Int32Array;

    constructor(index: number[], value: number[]) {
        this.index = new Int32Array(index);
        this.value = new Int32Array(value);
    }
}

export class SymbolDirectory {
    quantities: Int32Array;
    public codeTable: Int32Array;
    public codeIndexLookup: number[];

    constructor(symbols: number) {
        this.quantities = new Int32Array(symbols);
        this.codeTable = SymbolDirectory.initCharCodeTable();
        this.codeIndexLookup = this.createIndexLookup(this.codeTable);
    }

    private createIndexLookup(table: Int32Array) {
        const r: number[] = [];

        for (let i = 0; i < table.length; i++) {
            r[table[i]] = i;
        }

        return r;
    }

    public static initCharCodeTable(): Int32Array {
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

        return new Int32Array(result);
    }

    public findIndex(code: number): number {
        return this.codeIndexLookup[code];
    }

    /** increment quantity for symbol */
    public inc(symbol: number): void {
        this.quantities[symbol]++;
    }

    public generateCodes(): void {
        this.codeTable = new Int32Array(
            // create index array [0, 1, 2, 3, ...]
            Array.from(Array(Packer.Symbols).keys())
                // sort index by quantities... to be stable we use "quantities + index" as value
                .sort((x1, x2) => ((this.quantities[x2] << 16) + x2) - ((this.quantities[x1] << 16) + x1))
        );

        // we reduce the original quantity by 2 to the impact for the next CreateCodeTableFromFrequency() call
        for (let i = 0; i < Packer.Symbols; i++) {
            this.quantities[i] = this.quantities[i] / 2;
        }

        this.codeIndexLookup = this.createIndexLookup(this.codeTable);
    }
}

export class Packer {
    ///  Max number of Huffman encoded symbols
    public static Symbols = 274;

    public static createSymbolDirectory(): SymbolDirectory {
        return new SymbolDirectory(Packer.Symbols);
    }

    //  LZ77 table indexing sequence length
    protected static LengthTable = new IndexValueTable(
        [1, 2, 3, 4, 5, 6, 7, 8],
        [0x008, 0x00A, 0x00E, 0x016, 0x026, 0x046, 0x086, 0x106]
    );

    // LZ77 table indexing sequence offset in window
    protected static DistanceTable = new IndexValueTable(
        [0, 0, 1, 2, 3, 4, 5, 6],
        [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40]
    );

    protected static DefaultHuffmanTable = new IndexValueTable(
        [0x2, 0x3, 0x3, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x4, 0x5, 0x5, 0x5],
        [0x0, 0x4, 0xC, 0x14, 0x24, 0x34, 0x44, 0x54, 0x64, 0x74, 0x84, 0x94, 0xA4, 0xB4, 0xD4, 0xF4]
    );
}
