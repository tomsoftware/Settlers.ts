module Settlers {

    /** a image color palette */
    export class Palette {
        private palette: Uint32Array;

        constructor(count:number = 256) {
            this.palette = new Uint32Array(count)
        }

        public setRGB(index: number, r: number, g: number, b: number) {
            this.palette[index] = r | (g << 8) | (b << 16) | (255 << 24);
        }

        public getColor(index: number) {
            return this.palette[index];
        }

        public read3BytePalette(buffer: Uint8Array, pos: number) {
            for (let i = 0; i < this.palette.length; i++) {

                let r = buffer[pos++];
                let g = buffer[pos++];
                let b = buffer[pos++];

                this.setRGB(i, r, g, b);
            }

            return pos;
        }

        public read16BitPalette(buffer: BinaryReader, pos: number = 0) {
            buffer.setOffset(pos);

            for (let i = 0; i < this.palette.length; i++) {
                const value1 = buffer.readByte();
                const value2 = buffer.readByte();

                const r = value2 & 0xF8;
                const g = (value1 >> 3)  | (value2 << 5) & 0xFC;
                const b = (value1 << 3) & 0xF8;

                this.setRGB(i, r, g, b);
            }

            return pos;
        }
    }
}