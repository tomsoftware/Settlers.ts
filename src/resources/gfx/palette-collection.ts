module Settlers {

    export class PaletCollection {
        private log: LogHandler = new LogHandler("PaletCollection");
        private paletts: Array<Palette> = [];
        
        public getPaletteByGfxIndex(index: number) {
            return this.paletts[index];
        }

/*
        public getPaletteByGfxIndex(index: number) {
            const offset = this.palettIndexList.getPaletteOffset(index);
            return this.palettsMap.get(offset);
        }
*/

        public constructor(palettIndexList: PilFileReader, pa6File: BinaryReader) {
      
            this.log.debug("pa6File.length: " + pa6File.length);

            /// we want to get all palletts from the file
            /// but we dont know the the size of the pallets
            /// so we read all distinct pos
            const positions = palettIndexList.getDistinct();

            const palettsMap : Map<number, Palette> = new Map();

            /// push the length of the pallet file to be able to calc
            ///  also the last length
            positions.push(pa6File.length);

            for (let i = 1; i < positions.length; i++) {
                const offset = positions[i - 1];
                const p = new Palette();
                const count = (positions[i] - offset) / 2;
                p.read16BitPalette(pa6File, offset, count);

                palettsMap.set(offset, p);
            }

            this.paletts = palettIndexList.getTable()
                .map((offset) => palettsMap.get(offset));

        }
    }
}