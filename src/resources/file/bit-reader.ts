import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from './binary-reader';

/** Reads bits from a BinaryReader */
export class BitReader {
    private data: Uint8Array;
    private pos: number;
    private buffer: number;
    private bufferLen: number;
    private readonly log: LogHandler = new LogHandler('BitReader');

    constructor(fileReader: BinaryReader, offset?: number, sourceLength?: number) {
        // - get the data from the source
        this.data = fileReader.getBuffer(offset, sourceLength);
        this.pos = 0;

        this.buffer = 0;
        this.bufferLen = 0;

        Object.seal(this);
    }

    /** return the current curser position */
    public getSourceOffset(): number {
        return this.pos;
    }

    public sourceLeftLength(): number {
        return Math.max(0, (this.data.length - this.pos));
    }

    public getBufferLength():number {
        return this.bufferLen;
    }

    public resetBitBuffer() :void {
        this.pos = this.pos - (this.bufferLen >> 3); // - move back the in-buffer for all not used byte
        this.bufferLen = 0; // - clear bit-buffer
        this.buffer = 0;
    }

    /** read and return [bitCount] bits from the stream */
    public read(readLength: number): number {
        // - fill bit buffer
        if (this.bufferLen < readLength) {
            // - read next byte
            if (this.pos >= this.data.length) {
                this.log.error('Unable to read more date - End of data!');
                return 0;
            }

            const readInByte = this.data[this.pos];
            this.pos++;

            this.buffer |= (readInByte << (24 - this.bufferLen));
            this.bufferLen += 8;
        }

        // - read [readLength] bits
        const bitValue = this.buffer >>> (32 - readLength);

        this.buffer = this.buffer << readLength;
        this.bufferLen -= readLength;

        return bitValue;
    }

    public eof(): boolean {
        return ((this.pos >= this.data.length) && (this.bufferLen <= 0));
    }

    public toString(): string {
        return 'pos: ' + this.pos + ' len: ' + this.data.length + ' eof?: ' + this.eof();
    }
}
