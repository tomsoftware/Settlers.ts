import { BinaryReader } from '@/resources/file/binary-reader';
import { Compression } from '@/resources/file/compress';
import { Decompress } from '@/resources/file/decompress';
import { expect } from 'chai';

describe('compression/decompression.ts', () => {
	it('reader returns: 10011 on 0x13', () => {
		const srcText = 'Hallo World';
		const encoder = new TextEncoder();
		const buffer = encoder.encode(srcText);

		const comp = Compression.compress(new BinaryReader(buffer));

		const unComp = new Decompress();
		const result = unComp.unpack(comp, 0, comp.length, srcText.length);

		expect(result.readString()).to.equal(srcText);
	});
});
