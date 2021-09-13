import { BinaryReader } from '@/resources/file/binary-reader';
import { Compression } from '@/resources/file/compress';
import { Decompress } from '@/resources/file/decompress';
import { expect } from 'chai';

describe('compression/decompression.ts', () => {
    it('compression decompression round trip', () => {
        const srcText = 'Hallo World 123456789 123456789 1234567890 1234560987651234 12 hallo world';
        const buffer = new BinaryReader(new TextEncoder().encode(srcText));

        const comp = Compression.compress(buffer);
        const unComp = new Decompress();
        const result = unComp.unpack(comp, 0, comp.length, srcText.length);

        expect(result.readString()).to.equal(srcText);
    });

    it('Decompress can unpack byte data', () => {
        const data = [129, 149, 146, 43, 61, 69, 45, 33, 48, 86, 62, 126, 114, 146, 108, 172, 156, 229, 41, 89, 122, 41, 169,
            218, 2, 179, 148, 114, 83, 229, 104, 101, 100, 138, 204, 199, 83, 211, 21, 145, 156, 148, 92, 60, 57, 119, 142,
            144, 152, 145, 142, 164, 160, 43, 51, 57, 71, 36, 86, 106, 152, 172, 124, 180, 161, 90, 9, 217, 89, 105, 186, 82,
            179, 146, 101, 103, 168, 163, 167, 232, 105, 215, 15, 14, 95, 99, 164, 38, 1, 1, 249, 202, 82, 180, 146, 212, 50,
            165, 100, 229, 168, 228, 138, 200, 206, 83, 201, 77, 149, 153, 150, 158, 162, 156, 159, 43, 47, 69, 41, 64, 184,
            120, 115, 0, 36, 15, 99, 230, 99, 164, 38, 3, 4, 50, 178, 244, 82, 50, 128, 131, 13, 28, 229, 34, 225, 225, 204,
            12, 172, 144, 64, 135, 31, 57, 75, 45, 55, 40, 86, 146, 90, 158, 58, 126, 70, 128, 16, 170, 8, 47, 230, 105, 151,
            15, 14, 92, 229, 168, 228, 138, 207, 81, 71, 72, 76, 75, 77, 202, 21, 135, 146, 157, 149, 166, 159, 160, 43, 47, 57,
            51, 66, 86, 106, 152, 173, 36, 117, 41, 88, 249, 41, 16, 193, 60, 128, 3, 213, 214, 74, 58, 140, 16, 203, 146, 160,
            43, 59, 37, 63, 39, 57, 63, 52, 24, 31, 82, 71, 76, 208, 211, 201, 80, 21, 142, 155, 145, 43, 47, 44, 8, 104, 55, 6,
            3, 115, 83, 148, 114, 83, 82, 83, 116, 37, 103, 36, 193, 5, 9, 41, 185, 41, 170, 98, 180, 146, 211, 51, 37, 101, 228,
            167, 39, 99, 167, 228, 101, 169, 228, 138, 208, 75, 82, 149, 148, 162, 155, 143, 156, 142, 161, 160, 92, 41, 253];
        const buffer = new BinaryReader(new Uint8Array(data));

        const unComp = new Decompress();
        const resultBuffer = unComp.unpack(buffer, 0, buffer.length, 396);

        const result = resultBuffer.readString();
        expect(result).contains('The quick brown fox jumps over the lazy dog.');
        expect(result).contains('A quick movement of the enemy will jeopardize six gunboats.');
    });
});
