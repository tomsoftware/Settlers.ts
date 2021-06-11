import { MapGameType } from './map-game-type';
import { MapStartResources } from './map-start-resources';

/** store general map information */
export class GeneralMapInformation {
    public gameType: MapGameType = MapGameType.multiplayer;
    public playerCount = 0;
    public startResources = MapStartResources.unknown;

    public toString(): string {
      return 'gameType: ' + MapGameType[this.gameType] + '; ' +
            'playerCount: ' + this.playerCount + '; ' +
            'startResources: ' + MapStartResources[this.startResources];
    }
}
