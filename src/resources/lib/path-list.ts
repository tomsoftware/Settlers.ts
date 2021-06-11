import { Path } from '@/utilities/path';

/** a list of paths */
export class PathList {
    private pathNames: string[];

    /** find the index in this.pathNames for a given pathName */
    public findPathIndex(pathName: string): number {
      const path = Path.fixPath(pathName).toUpperCase();

      for (let i = 0; i < this.pathNames.length; i++) {
        if (this.pathNames[i].toUpperCase() === path) {
          return i;
        }
      }
      return -1;
    }

    /** return the path-name for a given path index */
    public getPath(pathIndex: number):string {
      if ((pathIndex < 0) || (pathIndex >= this.pathNames.length)) {
        return '/??/';
      }
      return this.pathNames[pathIndex];
    }

    constructor(paths: string[]) {
      this.pathNames = new Array<string>(paths.length);

      for (let i = 0; i < paths.length; i++) {
        this.pathNames[i] = Path.fixPath(paths[i]);
      }

      Object.seal(this);
    }
}
