
/// <summary>
/// Description of Compression.
/// src: https://bitbucket.org/AngryKirC/noxedit2014/src/master/Shared/Kirc/NoxLzCompression.cs
/// </summary>
export class Compression
{
    /// <summary>
    /// Max number of Huffman encoded symbols
    /// </summary>
    const SYMBOLS = 274;

    /// <summary>
    /// LZ77 history window length (64KB)
    /// </summary>
    const WINDOW_SIZE = 0x10000;

    /// <summary>
    /// Compressor will rebuild symbol alphabet after this #of symbols
    /// </summary>
    const REBUILD_COUNTER = 8192;

    /// <summary>
    /// LZ77 table indexing sequence length
    /// </summary>
    static LENGTH_TABLE = [
        1, 0x008,
        2, 0x00A,
        3, 0x00E,
        4, 0x016,
        5, 0x026,
        6, 0x046,
        7, 0x086,
        8, 0x106
    ];

    /// <summary>
    /// LZ77 table indexing sequence offset in window
    /// </summary>
    static DISTANCE_TABLE = [
        0, 0x00,
        0, 0x01,
        1, 0x02,
        2, 0x04,
        3, 0x08,
        4, 0x10,
        5, 0x20,
        6, 0x40
    ];
    
    // Variables
    /// <summary>
    /// Huffman alphabet containing symbols sorted by their occurence rate
    /// </summary>
    private SymbolAlphabet = new Int32Array(this.SYMBOLS);
    //
    private SymbIndexTable: number[];
    /// <summary>
    /// Bit-by-bit reader implementation
    /// note that bits of each byte are read in reverse order
    /// </summary>
    BitReader bitrdr;
    /// <summary>
    /// Bit-by-bit writer implementation
    /// </summary>
    BitWriter bitwtr;
    /// <summary>
    /// LZ77 data history window
    /// </summary>
    int[] LZWindow;
    /// <summary>
    /// Current offset in LZ77 history window
    /// </summary>
    int LZPosWindow;
    /// <summary>
    /// Table addressing how many times each symbol occurs
    /// </summary>
    int[] SymbolCounter;
    /// <summary>
    /// Offset in the resulting byte array (decompression)
    /// Offset in source byte array (compression)
    /// </summary>
    int outPos;
    
    private NoxLzCompression() {}

    private void BuildInitialAlphabet()
    {
        int pos = 0;
        for (; pos <= 15; pos++) SymbolAlphabet[pos] = pos + 0x100;

        SymbolAlphabet[pos] = 0; pos++;
        SymbolAlphabet[pos] = 0x20; pos++;
        SymbolAlphabet[pos] = 0x30; pos++;
        SymbolAlphabet[pos] = 0xFF; pos++;
        for (int i = 1; i <= 0x111; i++)
        {
            if (Array.IndexOf(SymbolAlphabet, i) < 0)
            {
                SymbolAlphabet[pos] = i; pos++;
            }
        }
        
        SymbIndexTable = new int[] {
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
        };
    }
    
    /*
    private void RebuildAlphabet()
    {
        int[] huffman = new int[SYMBOLS];
        int i = SYMBOLS;
        while (i > 0) { i--; huffman[i] = i; }
        
        List<int> l = huffman.ToList();
        l.Sort((x1, x2) => ((SymbolCounter[x2] << 16) + x2) - ((SymbolCounter[x1] << 16) + x1));
        SymbolAlphabet = l.ToArray();
    }
    */
    private RebuildAlphabet() {
        let huffman: number[] = new Array(this.SYMBOLS);
        let i: number = this.SYMBOLS;
        while ((i > 0)) {
            i--;
            huffman[i] = i;
        }
        
        let l: List<number> = huffman.ToList();
        (((this.SymbolCounter[x2] + 16) 
                    + x2) 
                    - ((this.SymbolCounter[x1] + 16) 
                    + x1));
        this.SymbolAlphabet = l.ToArray();
    }

    private bool DecompressImpl(byte[] dst, int dstLen)
    {
        int code, bits, offset, idx, symbol, length, distance;
        
        while (outPos < dstLen)
        {
            code = bitrdr.Read(4);
            // SHL one bit is analogical to multiplying by 2
            bits = SymbIndexTable[code << 1];
            offset = SymbIndexTable[(code << 1) + 1];
            // position of the symbol in alphabet
            idx = bitrdr.Read(bits) + offset;
            symbol = SymbolAlphabet[idx];
            SymbolCounter[symbol]++;
            
            if (symbol < 0x100)
            {
                // Output literal (plain byte)
                dst[outPos] = (byte) symbol; outPos++;
                LZWindow[LZPosWindow % WINDOW_SIZE] = symbol;
                LZPosWindow++;
            }
            else if (symbol == 0x110)
            {
                // Rebuild symbol alphabet
                RebuildAlphabet();
                // Divide all counts by two
                int i = SYMBOLS;
                while (i > 0)
                {
                    i--;
                    SymbolCounter[i] = SymbolCounter[i] >> 1;
                }
                // Parse new Huffman table
                bits = 0;
                offset = 0;
                length = 0;
                i = 16;
                while (i > 0)
                {
                    i--;
                    while (bitrdr.ReadBit() == 0) bits++;
                    SymbIndexTable[length] = bits;
                    SymbIndexTable[length + 1] = offset;
                    length += 2;
                    offset += 1 << bits;
                }
            }
            else if (symbol >= 0x111)
            {
                return false; // symbol out of range
            }
            else
            {
                // LZ77
                // find sequence length
                length = 4;
                if (symbol < 0x108)
                {
                    length += symbol - 0x100;
                }
                else
                {
                    idx = symbol - 0x108;
                    bits = LENGTH_TABLE[idx << 1];
                    offset = LENGTH_TABLE[(idx << 1) + 1];
                    length += offset + bitrdr.Read(bits);
                }
                
                // read window offset the sequence is located at
                code = bitrdr.Read(3);
                bits = DISTANCE_TABLE[code << 1];
                offset = DISTANCE_TABLE[(code << 1) + 1];
                distance = (offset << 9) + bitrdr.Read(bits + 9);
                
                idx = LZPosWindow - distance;
                // Copy sequence from history window
                for (int i = 0; i < length; i++)
                {
                    symbol = LZWindow[(idx + i) % WINDOW_SIZE];
                    
                    dst[outPos] = (byte) symbol; outPos++;
                    
                    LZWindow[LZPosWindow % WINDOW_SIZE] = symbol;
                    LZPosWindow++;
                }
            }
        }
        
        return true;
    }
    
    public unsafe byte[] CompressImpl(byte[] src, int srcLen)
    {
        int back = 0, huffmanPos, tabPos, matchLen = 0, refLen, refOff = 0, remain, symbol, seq, rebuild = REBUILD_COUNTER;
        
        fixed (byte* srcp = src)
        {
            while (outPos < srcLen)
            {
                if (rebuild < 0)
                {
                    // Rebuild symbol alphabet
                    // so that more frequent symbols will be on top and will take less bits to encode
                    symbol = 0x110;
                    rebuild = REBUILD_COUNTER;
                }
                else
                {
                    // Scan LZ window for at least 4 bytes matching these from src
                    back = outPos - (WINDOW_SIZE / 2); // offset back to some position (less = faster)
                    if (back < 0) back = 0; // index cannot be negative
                    // scan from beginning of window till the current position
                    seq = *(int*)(srcp + outPos);
                    // possible optimiziation: by scanning in reverse order one can achieve smaller window offsets (=less bits)
                    while (back < outPos)
                    {
                        matchLen = 0;
                        // determine length of matching sequence by comparing 4byte chunks
                        while (*(int*)(srcp + back + matchLen) == seq)
                        {
                            if ((outPos + matchLen + 4) >= srcLen) break; // boundary chk
                            matchLen += 4;
                            seq = *(int*)(srcp + outPos + matchLen);
                        }
                        if (matchLen >= 4) break;
                        back += 4;
                    }
                    
                    if (matchLen >= 4 && matchLen <= 517) // quickfix: too large to encode
                    {
                        // Proceed on LZ logic
                        // Encode length into symbol
                        if (matchLen <= 11) // 7+4 max
                        {
                            // length = symbol - 0x100 + 4
                            symbol = 0x100 + (matchLen - 4);
                        }
                        else
                        {
                            // else use length table
                            for (tabPos = 0; tabPos < 8; tabPos++)
                            {
                                // maximum offset value that can be represented by using this table entry
                                refLen = LENGTH_TABLE[(tabPos << 1) + 1] + (1 << (LENGTH_TABLE[tabPos << 1])) - 1;
                                if ((matchLen - 4) <= refLen) break;
                            }
                            symbol = 0x108 + tabPos;
                        }
                        // proceed - write symbol and then encode
                    }
                    else
                    {
                        // Literal symbol (plain byte)
                        symbol = src[outPos]; outPos++;
                    }
                }
                rebuild--;
                
                // increment symbol counter
                SymbolCounter[symbol]++;
                // Search for that symbol in the Huffman alphabet
                huffmanPos = 0;
                while (huffmanPos <= SYMBOLS)
                {
                    if (SymbolAlphabet[huffmanPos] == symbol) break; // Found
                    huffmanPos++;
                }
                // Encode symbol reference
                // we want to have this encoded in less #of bits
                for (tabPos = 0; tabPos < 16; tabPos++)
                {
                    // maximum value that can be represented directly by #bits
                    refLen = (1 << SymbIndexTable[tabPos << 1]) - 1;
                    // this val is added to the offset
                    refOff = SymbIndexTable[(tabPos << 1) + 1];
                    // check if offset is less than pos itself
                    if (huffmanPos >= refOff)
                    {
                        // enough bits to represent remaining part of the offset
                        if (refLen >= (huffmanPos - refOff)) break;
                        // if not then lookup next entry
                    }
                    else
                    {
                        throw new ApplicationException("Unable to find correct alphabet reference");
                    }
                }
                // position of symbol in alphabet minus table offset
                remain = huffmanPos - refOff;
                // write encoded symbol
                bitwtr.Write(tabPos, 4);
                bitwtr.Write(remain, SymbIndexTable[tabPos << 1]);
                
                if (symbol == 0x110)
                {
                    // Rebuild symbol alphabet
                    RebuildAlphabet();
                    // Divide all counts by two
                    int i = SYMBOLS;
                    while (i > 0)
                    {
                        i--;
                        SymbolCounter[i] = SymbolCounter[i] >> 1;
                    }
                    // TODO actually *REBUILD* symbol indexer according to symbol usage frequency
                    // For now just output default table
                    for (i = 0; i < 32; i += 2)
                    {
                        back = SymbIndexTable[i];
                        if (i >= 2) back -= SymbIndexTable[i - 2];
                        while (back > 0)
                        {
                            back--;
                            bitwtr.Write(0, 1);
                        }
                        bitwtr.Write(1, 1);
                    }
                }
                else if (symbol >= 0x100)
                {
                    // if there was an application of LZ77
                    int wndoff = outPos - back;
                    outPos += matchLen;
                    
                    // if length table was used, write entry index and offset
                    if (symbol >= 0x108)
                        bitwtr.Write(matchLen - LENGTH_TABLE[((symbol - 0x108) << 1) + 1] - 4, LENGTH_TABLE[(symbol - 0x108) << 1]);
                    
                    // encode DISTANCE_TABLE
                    for (tabPos = 0; tabPos < 8; tabPos++)
                    {
                        // maximum offset value that can be represented by using this table entry
                        refLen = ((DISTANCE_TABLE[(tabPos << 1) + 1]) << 9) + (1 << (9 + DISTANCE_TABLE[tabPos << 1])) - 1;
                        if (wndoff <= refLen) break;
                    }
                    
                    // write code
                    bitwtr.Write(tabPos, 3);
                    // distance = (TableVal2 << 9) + bitrdr.Read(TableVal1 + 9)
                    bitwtr.Write(wndoff - (DISTANCE_TABLE[(tabPos << 1) + 1] << 9), DISTANCE_TABLE[tabPos << 1] + 9);
                }
            }
        }
        
        // close stream, return contents
        return bitwtr.Close();
    }
    
    public static bool Decompress(byte[] src, byte[] dst)
    {
        NoxLzCompression nxz = new NoxLzCompression();
        nxz.BuildInitialAlphabet();
        // initialize required variables
        nxz.bitrdr = new BitReader(src);
        nxz.LZWindow = new int[WINDOW_SIZE];
        nxz.LZPosWindow = 0;
        nxz.SymbolCounter = new int[SYMBOLS];
        nxz.outPos = 0;
        
        return nxz.DecompressImpl(dst, dst.Length);
    }
    
    public static byte[] Compress(byte[] src)
    {
        NoxLzCompression nxz = new NoxLzCompression();
        nxz.BuildInitialAlphabet();
        // init variables
        nxz.bitwtr = new BitWriter();
        nxz.SymbolCounter = new int[SYMBOLS];
        
        return nxz.CompressImpl(src, src.Length);
    }
}
