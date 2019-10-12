module Settlers {


    /** provides access to the original landscape data */
    export class OriginalLandscape implements IMapLandscape {

        private log: LogHandler = new LogHandler("OriginalLandscape");
        private data: Uint8Array;
        private mapSize: Size;

        public constructor(mapFile: OriginalMapFile, mapSize: Size, mapChunkType: MapChunkType) {
            this.mapSize = mapSize;

            let reader = mapFile.getChunkReader(mapChunkType);
            if (!reader) {
                this.log.log('No landscape data in this file!');
                this.data = new Uint8Array(0);
                return;
            }

            this.data = reader.getBuffer();
        }

        /** returns every n-th byte of the data buffer */
        public getSlice(offset: number): Uint8Array {
            let land = this.data;
            let result = new Uint8Array(this.mapSize.width * this.mapSize.height);

            if ((land.length * 4) != result.length) {
                this.log.log('Size of landscape Data is wrong!');
                return new Uint8Array(0);
            }

            for (let i = 0, j = offset; i < land.length; i += 4, j++) {
                result[j] = land[i];
            }
        }

        
        public getGroundHeight(): Uint8Array {
            return this.getSlice(0);
        }

        public getGroundType(): Uint8Array {
            return this.getSlice(1);
        }
    }
}
