import { BinaryReader } from './binary-reader';

export class BitWriter {
    private output: number[] = [];
    private currentByte = 0;
    private currentByteLength = 0;

    public write(value: number, length: number) {
        let chByte = this.currentByte;
        let chByteLen = this.currentByteLength;

        for (let i = 0; i < length; i++) {
            chByte = (chByte << 1) | (value >> (length - i - 1) & 0x1);
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
        while (this.currentByteLength > 0) {
            this.write(0, 1);
        }

        return new BinaryReader(new Uint8Array(this.output));
    }
}
