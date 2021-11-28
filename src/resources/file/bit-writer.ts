import { BinaryReader } from './binary-reader';

export class BitWriter {
    private output: number[] = [];
    private currentByte = 0;
    private currentByteLength = 0;

    /**
     * not sure... should result in same way as "write()" but
     *   - seems not to be faster
     *   - is not as readable as "write"
     */
    public writeNew(value: number, length: number): void {
        let chByte = this.currentByte;
        let chByteLen = this.currentByteLength;

        while (length > 0) {
            const spaceBitCount = 8 - chByteLen;
            const needBitCount = (spaceBitCount < length) ? spaceBitCount : length;

            // shift to the right or to the left?
            const shiftNum = spaceBitCount - length;
            if (shiftNum < 0) {
                // the value we need to write to current byte
                //  needs more bits than remain
                chByte = chByte | (value >> (-shiftNum));
                value = value & ((1 << (-shiftNum)) - 1);
                length -= needBitCount;
            } else {
                // the value we need to write to current byte
                //  needs less bits than remain
                chByte = chByte | (value << shiftNum);
                value = 0;
                length = 0;
            }

            chByteLen = chByteLen + needBitCount;

            if (chByteLen >= 8) {
                this.output.push(chByte);
                chByte = 0;
                chByteLen = 0;
            }
        }

        this.currentByte = chByte;
        this.currentByteLength = chByteLen;
    }

    public write(value: number, length: number): void {
        let chByte = this.currentByte;
        let chByteLen = this.currentByteLength;

        for (let i = length - 1; i >= 0; i--) {
            chByte = (chByte << 1) | ((value >> i) & 0x1);
            chByteLen++;
            if (chByteLen >= 8) {
                this.output.push(chByte);
                chByte = 0;
                chByteLen = 0;
            }
        }

        this.currentByte = chByte;
        this.currentByteLength = chByteLen;
    }

    public toReader(): BinaryReader {
        // fill up last byte
        while (this.currentByteLength > 0) {
            this.write(0, 1);
        }

        return new BinaryReader(new Uint8Array(this.output));
    }
}
