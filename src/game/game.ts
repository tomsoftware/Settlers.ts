import { FileManager } from '@/resources/file-manager';
import { IMapLoader } from '@/resources/map/imap-loader';
import { MapSize } from '@/utilities/map-size';

/** contains the game state */
export class Game {
    public mapSize: MapSize;
    public groundHeight: Uint8Array;
    public groundType: Uint8Array;
    public fileManager: FileManager;

    public constructor(fileManager: FileManager, mapLoader: IMapLoader) {
        this.fileManager = fileManager;
        this.mapSize = mapLoader.mapSize;
        this.groundHeight = mapLoader.landscape.getGroundHeight();
        this.groundType = mapLoader.landscape.getGroundType();

        Object.seal(this);
    }
}
