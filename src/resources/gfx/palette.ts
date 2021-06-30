import { BinaryReader } from '../file/binary-reader';

/** a image color palette */
export class Palette {
                private palette: Uint32Array;

                constructor(count = 256) {
                    this.palette = new Uint32Array(count);

                    Object.seal(this);
                }

                public setRGB(index: number, r: number, g: number, b: number): void {
                    this.palette[index] = r | (g << 8) | (b << 16) | (255 << 24);
                }

                public getColor(index: number):number {
                    return this.palette[index];
                }

                public read3BytePalette(buffer: Uint8Array, pos: number):number {
                    for (let i = 0; i < this.palette.length; i++) {
                        const r = buffer[pos++];
                        const g = buffer[pos++];
                        const b = buffer[pos++];

                        this.setRGB(i, r, g, b);
                    }

                    return pos;
                }

                public read16BitPalette(buffer: BinaryReader, pos = 0) : number {
                    buffer.setOffset(pos);

                    for (let i = 0; i < this.palette.length; i++) {
                        const value1 = buffer.readByte();
                        const value2 = buffer.readByte();

                        const r = value2 & 0xF8;
                        const g = (value1 >> 3) | (value2 << 5) & 0xFC;
                        const b = (value1 << 3) & 0xF8;

                        this.setRGB(i, r, g, b);
                    }

                    return pos;
                }
}
