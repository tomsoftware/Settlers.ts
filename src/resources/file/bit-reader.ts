/// <reference path="binary-reader.ts"/>

module Settlers {

  /** Reads bits from a BinaryReader */
  export class BitReader {

    private data: Uint8Array;
    private pos: number;
    private buffer: number;
    private bufferLen: number;
    private log: LogHandler = new LogHandler("BitReader");

    constructor(fileReader: BinaryReader, offset: number, sourceLength: number) {
      //- get the data from the source
      this.data = fileReader.getBuffer(offset, sourceLength);
      this.pos = 0;

      this.buffer = 0;
      this.bufferLen = 0;
    }


    /** return the current curser position */
    public getSourceOffset(): number {
      return this.pos;
    }


    public sourceLeftLength(): number {
      return Math.max(0, (this.data.length - this.pos));
    }


    public getBufferLength() {
      return this.bufferLen;
    }

    public resetBitBuffer() {

      this.pos = (this.pos - this.bufferLen / 8); //- move back the inbuffer for all not used byte
      this.bufferLen = 0; //- clear bit-buffer
      this.buffer = 0;
    }

    /** read and return [bitCount] bits from the stream */
    public read(readLenght: number): number {

      //- fill bit buffer
      if (this.bufferLen < readLenght) {

        //- read next byte
        if (this.pos >= this.data.length) {
          this.log.log("Unable to read more date - End of data!");
          return 0;
        }

        var readInByte = this.data[this.pos];
        this.pos++;

        this.buffer |= (readInByte << (24 - this.bufferLen));
        this.bufferLen += 8;
      }

      //- read [readLength] bits
      let bitValue = this.buffer >>> (32 - readLenght);

      this.buffer = this.buffer << readLenght;
      this.bufferLen -= readLenght;

      return bitValue;
    }


    public eof(): boolean {
      return ((this.bufferLen <= 0) && (this.pos >= this.data.length))
    }
  }
}