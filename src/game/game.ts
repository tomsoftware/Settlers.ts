import { IMapLoader } from '@/resources/map/imap-loader';

/** contains the game state */
export class Game {
		public width: number;
		public height: number;
		public groundHeight: Uint8Array;
		public groundType: Uint8Array;

		public constructor(mapLoader: IMapLoader) {
			this.width = mapLoader.mapSize.width;
			this.height = mapLoader.mapSize.height;
			this.groundHeight = mapLoader.landscape.getGroundHeight();
			this.groundType = mapLoader.landscape.getGroundType();

			Object.seal(this);
		}
}
