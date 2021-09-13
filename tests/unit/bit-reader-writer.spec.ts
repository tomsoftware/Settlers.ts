import { BinaryReader } from '@/resources/file/binary-reader';
import { BitReader } from '@/resources/file/bit-reader';
import { BitWriter } from '@/resources/file/bit-writer';
import { expect } from 'chai';

describe('bit-reader/bit-writer.ts', () => {
    it('reader returns: 10011 on 0x13', () => {
        const r = new BitReader(new BinaryReader(new Uint8Array([0x13])));

        expect(r.read(1)).to.equal(0);
        expect(r.read(1)).to.equal(0);
        expect(r.read(1)).to.equal(0);
        expect(r.read(1)).to.equal(1);
        expect(r.read(1)).to.equal(0);
        expect(r.read(1)).to.equal(0);
        expect(r.read(1)).to.equal(1);
        expect(r.read(1)).to.equal(1);
    });

    it('reader and writer are the same for 43', () => {
        const w = new BitWriter();
        w.write(43, 8);

        const r = new BitReader(w.toReader());

        expect(r.read(8)).to.equal(43);
    });

    it('reader and writer are the same for 43 33 12', () => {
        const w = new BitWriter();

        w.write(43, 7);
        w.write(33, 7);
        w.write(12, 7);
        w.write(23456, 15);

        const r = new BitReader(w.toReader());

        expect(r.read(7)).to.equal(43);
        expect(r.read(7)).to.equal(33);
        expect(r.read(7)).to.equal(12);
        expect(r.read(15)).to.equal(23456);
    });

    it('reader and writer are the same for 10011', () => {
        const w = new BitWriter();
        w.write(1, 1);
        w.write(0, 1);
        w.write(0, 1);
        w.write(1, 1);
        w.write(1, 1);

        const r = new BitReader(w.toReader());

        expect(r.read(1)).to.equal(1);
        expect(r.read(1)).to.equal(0);
        expect(r.read(1)).to.equal(0);
        expect(r.read(1)).to.equal(1);
        expect(r.read(1)).to.equal(1);
    });
});
