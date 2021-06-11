import { BinaryReader } from './binary-reader';

/** Calculates a settlers 4 the check sum */
export class ChecksumCalculator {
    static keyTable: Uint16Array = ChecksumCalculator.createKeyTable();

    public static calc(data: BinaryReader, offset = -1, length = -1) :number {
      const keyTable = ChecksumCalculator.keyTable;

      /// set offset
      if (offset > 0) {
        data.setOffset(offset);
      }

      /// get length of content
      if (length < 0) {
        length = data.length - data.getOffset();
      }

      let key = 0;

      for (let i = 0; i < length; i++) {
        key = (key >> 8) ^ keyTable[(data.readByte() ^ key) & 0xFF];
      }

      /// swap high and lower byte
      return ((key << 8) | (key >> 8)) & 0xFFFF;
    }

    /** Create a Table of keys needed for calculating the checksum */
    private static createKeyTable() {
      const table = new Uint16Array(256);

      for (let i = 0; i < 256; i++) {
        /// 1. Round
        let value = i;
        let pos = i;

        for (let j = 7; j >= 0; j -= 1) {
          if (pos & 1) {
            value = value | (1 << j);
          } else {
            value = value & (~(1 << j));
          }
          pos = pos >> 1;
        }

        value = value << 8;

        /// 2. Round
        for (let j = 7; j >= 0; j--) {
          if (value & 0x8000) {
            value = (value + value) ^ 0x8005;
          } else {
            value = value << 1;
          }
        }

        /// 3. round
        pos = value;

        for (let j = 15; j > 0; j--) {
          if (pos & 1) {
            value = value | ((1 << j));
          } else {
            value = value & (~(1 << j));
          }

          pos = pos >> 1;
        }

        /// - save key to table
        table[i] = value & 0xFFFF;
      }

      return table;
    }
}
