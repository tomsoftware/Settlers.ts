/// <reference path="binary-reader.ts"/>

module Settlers {
  //------------------------
  // reads the bits on a BinaryReader
  export class BitReader {

    private binReader: BinaryReader;
    private buffer: number;
    private bufferLen: number;


    constructor(fileReader: BinaryReader, offset: number, sourceLength:number) {
      //- create a copy of the reader
      this.binReader = new BinaryReader(fileReader, offset, sourceLength, fileReader.filename);

      this.buffer = 0;
      this.bufferLen = 0;
    }


    /** return the current curser position */
    public getSourceOffset(): number {
      return this.binReader.getOffset();
    }


    public sourceLeftLength() : number {
      return Math.max(0, (this.binReader.length - this.binReader.getOffset()));
    }


    public getBufferLength() {
      return this.bufferLen;
    }

    public resetBitBuffer() {

      this.binReader.setOffset( this.binReader.getOffset() - this.bufferLen / 8 ); //- move back the inbuffer for all not used byte
      this.bufferLen = 0; //- clear bit-buffer
      this.buffer = 0;
    }

    /** read and return [bitCount] bits from the stream */
    public read(readLenght: number): number {

      //- fill bit buffer
      if (this.bufferLen < readLenght) {
        //- read next byte
        var readInByte = this.binReader.readByte();

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
      return ((this.bufferLen <= 0) && (this.binReader.eof()))
    }
  }
}