module Settlers {

    /** store general map information */
    export class GeneralInformation {
        gameType: number;
        playerCount: number;
        startResources: number;
        mapWidth: number;
        mapHeight: number;
        unknows5: number;
        unknows6: number;

        public readFromGameMap(reader: BinaryReader): boolean {

            if ((!reader) || (reader.length < 24)) {
                return false;
            }

            this.gameType = reader.readIntBE();
            this.playerCount = reader.readIntBE();
            this.startResources = reader.readIntBE();
            this.mapHeight = this.mapWidth = reader.readIntBE();
            this.unknows5 = reader.readIntBE();
            this.unknows6 = reader.readIntBE();

            return true;
        }

        public toString(): string {
            return "gameType: " + MapGameType[this.gameType] + "; "
                + "playerCount: " + this.playerCount + "; "
                + "startResources: " + MapStartResources[this.startResources] + "; "
                + "Map Size: " + this.mapWidth + " x " + this.mapHeight + "; "
                + "unknows5: " + this.unknows5 + "; "
                + "unknows6: " + this.unknows6;

        }
    }
}
