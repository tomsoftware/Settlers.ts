module Settlers {

    /** contains the game state */
    export class Game {
        public width: number;
        public height: number;
        public groundHeight: Uint8Array;
        public groundType: Uint8Array;

        public constructor(mapLoader: IMapLoader) {

            this.width = mapLoader.size.width;
            this.height = mapLoader.size.height;
            this.groundHeight = mapLoader.landscape.getGroundHeight();
            this.groundType = mapLoader.landscape.getGroundType();
        }
    }
}