import { LogHandler } from './log-handler';

/**
 * Stores height and width of the map
*/
export class MapSize {
    public readonly width : number;
    public readonly height : number;

    // allowed sizes: 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024
    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        const log = new LogHandler('MapSize');

        if (width !== height) {
            log.error('width and height of a map should equal! width ' + width + ' != height ' + height);
        }

        if (!Number.isInteger(width / 64)) {
            log.error('map width and height should by multiplier of 64!');
        }
    }

    /** geht the map index position form a x,y coordinates  */
    public toIndex(x: number, y: number) : number {
        return (x % this.width) + ((y % this.height) * this.width);
    }

    public toString(): string {
        return 'size: [' + this.width + ' x ' + this.height + ']';
    }
}
