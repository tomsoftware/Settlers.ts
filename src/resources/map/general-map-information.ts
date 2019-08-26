module Settlers {

    /** store general map information */
    export class GeneralMapInformation {
        gameType: number;
        playerCount: number;
        startResources: number;



        public toString(): string {
            return "gameType: " + MapGameType[this.gameType] + "; "
                + "playerCount: " + this.playerCount + "; "
                + "startResources: " + MapStartResources[this.startResources];

        }
    }
}
