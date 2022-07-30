import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from './binary-reader';

/** Handles a buffer and a position pointer to write to */
export class StreamWriter {
    private static log: LogHandler = new LogHandler('StreamWriter');
    protected data: Uint8Array;
    public pos: number;

    constructor(length: number) {
        this.data = new Uint8Array(length);
        this.pos = 0;

        Object.seal(this);
    }

    public getReader():BinaryReader {
        return new BinaryReader(this.data, 0, this.pos);
    }

    /** Read one Byte from the output stream */
    public getByte(offset: number): number {
        if (offset < 0) {
            StreamWriter.log.error('Read before data: @ ' + offset);
            return 0;
        }

        if (offset > this.data.length) {
            StreamWriter.log.error('Read behind data: size: ' + this.data.length + ' @ ' + offset);
            return 0;
        }

        return this.data[offset];
    }

    /** return the position the stream is writing to */
    public getWriteOffset() :number {
        return this.pos;
    }

    public getLength():number {
        return this.data.length;
    }

    public eof() : boolean {
        return ((this.pos < 0) || (this.pos >= this.data.length));
    }

    public getLeftSize() :number {
        return (this.data.length - this.pos);
    }

    /** Write one byte to the stream */
    public setByte(value: number): boolean {
        if ((this.pos < 0) || (this.pos > this.data.length)) {
            StreamWriter.log.error('write out of data: size: ' + this.data.length + ' @ ' + this.pos);
            return false;
        }

        this.data[this.pos] = value;
        this.pos++;

        return true;
    }
}
