module Settlers {

    /** a list of pathes */
    export class PathList {
        private pathNames: string[];

        /** find the index in this.pathNames for a given pathName */
        public findPathIndex(pathName: string): number {
            let path = Path.fixPath(pathName).toUpperCase();

            for (let i = 0; i < this.pathNames.length; i++) {
                if (this.pathNames[i].toUpperCase() == path) {
                    return i;
                }
            }
            return -1;
        }

        /** return the path-name for a given path index */
        public getPath(pathIndex: number):string {

            if ((pathIndex < 0) || (pathIndex >= this.pathNames.length)) {
                return "/??/";
            }
            return this.pathNames[pathIndex];
        }

        constructor(pathes: string[]) {
            this.pathNames = new Array<string>(pathes.length);

            for (let i = 0; i < pathes.length; i++) {
                this.pathNames[i] = Path.fixPath(pathes[i]);
            }
        }
    }
}