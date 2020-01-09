module Settlers {

  /** Class to provide a read pointer and readfunctions to a binary Buffer */
  export class BinaryReader {

    private log: LogHandler = new LogHandler("BinaryReader");
    public filename: string;
    protected data: Uint8Array;
    protected hiddenOffset: number;
    public length: number;
    public pos: number;


    constructor(dataArray?: BinaryReader | Uint8Array | ArrayBuffer | Blob, offset: number = 0, length?: number, filename: string = null) {

      if (offset == null) {
        offset = 0;
      }

      let dataLenght = 0;
      let srcHiddenOffset = 0;

      if (dataArray == null) {
        this.data = new Uint8Array(0);
        dataLenght = 0;
      } else if (dataArray instanceof BinaryReader) {
        //- if dataArray is BinaryReader use there data
        this.data = dataArray.data;
        dataLenght = dataArray.length;
        srcHiddenOffset = dataArray.hiddenOffset;

        if (!filename) {
          filename = dataArray.filename;
        }
      } else if (dataArray instanceof Uint8Array) {
        this.data = dataArray;
        dataLenght = dataArray.byteLength;
      }
      else if (dataArray instanceof ArrayBuffer) {
        this.data = new Uint8Array(dataArray);
        dataLenght = dataArray.byteLength;
      }
      else if (dataArray instanceof Blob) {
        this.data = new Uint8Array(<any>dataArray);
        dataLenght = this.data.byteLength;
      }
      else {
        this.data = dataArray;
        dataLenght = this.data.length;
        this.log.log("BinaryReader from unknown: " + dataArray + "; size:" + dataLenght);
      }

      if (length == null) length = dataLenght - offset;

      this.hiddenOffset = offset + srcHiddenOffset;
      this.length = length;
      this.pos = this.hiddenOffset;

      this.filename = (filename) ? filename : "[Unknown]";

    }

    /** return the selected data as new Uint8Array */
    public getBuffer(offset: number = 0, length: number = -1): Uint8Array {

      let l = (length >= 0) ? Math.min(this.length, length) : this.length;
      let o = this.hiddenOffset + offset;

      if ((l != this.data.length) || (o > 0)) {
        return new Uint8Array(this.data.slice(o, o + l));
      }
      else {
        return this.data;
      }

    }


    /** Read one Byte from stream */
    public readByte(offset?: number): number {
      if (offset != null) {
        this.pos = (offset + this.hiddenOffset);
      }

      if ((this.pos < 0) || (this.pos > this.data.length)) {
        this.log.log("read out of data: " + this.filename + " - size: " + this.data.length + " @ " + this.pos);
        return 0;
      }

      let v = this.data[this.pos];
      this.pos++;

      return v;
    }


    /** Read one DWord (4 Byte) from stream (little ending) */
    public readInt(length: number = 4, offset?: number): number {

      if (offset == null) offset = this.pos;

      if (length == 4) {
        let v: number = (this.data[offset] << 24) | (this.data[offset + 1] << 16) | (this.data[offset + 2] << 8) | (this.data[offset + 3]);
        this.pos = offset + 4;
        return v;
      }

      let v: number = 0;
      for (let i: number = length; i > 0; i--) {
        v = (v << 8) | this.data[offset];
        offset++;
      }

      this.pos = offset;

      return v;
    }

    /** Read one DWord (4 Byte) from stream (big ending) */
    public readIntBE(offset?: number): number {

      if (offset == null) offset = this.pos;

      if ((this.pos < 0) || (this.pos + 4 > this.data.length)) {
        this.log.log("read out of data: " + this.filename + " - size: " + this.data.length + " @ " + this.pos);
        return 0;
      }

      let v: number = (this.data[offset]) | (this.data[offset + 1] << 8) | (this.data[offset + 2] << 16) | (this.data[offset + 3] << 24);
      this.pos = offset + 4;

      return v;
    }


    /** Read one Word (2 Byte) from stream (big ending) */
    public readWord(offset?: number): number {
      if (offset == null) offset = this.pos;

      let v: number = (this.data[offset] << 8) | (this.data[offset + 1]);
      this.pos = offset + 2;

      return v;
    }

    /** Read one Word (2 Byte) from stream (big ending) */
    public readWordBE(offset?: number): number {
      if (offset == null) offset = this.pos;

      let v: number = (this.data[offset]) | (this.data[offset + 1] << 8);
      this.pos = offset + 2;

      return v;
    }


    /** Read a String */
    public readNullString(offset?: number): string {
      if (offset != null) {
        this.pos = offset + this.hiddenOffset;
      }

      let result = "";

      while (this.pos < this.length) {
        let v: number = this.data[this.pos];
        this.pos++;
        if (v == 0) {
          return result;
        }
        result += String.fromCharCode(v);
      }

      return "";
    }

    /** Read a String */
    public readString(length?: number, offset?: number): string {

      if (offset != null) {
        this.pos = offset + this.hiddenOffset;
      }

      if (length == null) {
        length = this.length - this.getOffset();
      }

      let result = "";

      for (let i = 0; i < length; i++) {
        let v: number = this.data[this.pos];
        this.pos++;

        result += String.fromCharCode(v);
      }
      return result;

    }

    /** return the current curser position */
    public getOffset(): number {
      return this.pos - this.hiddenOffset;
    }

    /** set the current curser position */
    public setOffset(newPos: number) {
      this.pos = newPos + this.hiddenOffset;
    }

    /** return true if the curserposition is out of data */
    public eof(): boolean {
      let pos = this.pos - this.hiddenOffset;
      return ((pos >= this.length) || (pos < 0));
    }

    /** return a String of the data */
    public readAll(): string {
      return this.readString(this.length, 0);
    }


  }
}