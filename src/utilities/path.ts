module Settlers {

    /**
    * Handle path name modification 
    */
    export class Path {

        /** fix the path seperator */
        public static fixPath(path:string) {
            return path.split("/").join("\\");
        }

        /** add an ending path seperator */
        public static addAnding(path:string):string {
            if ((path[path.length -1] == '/') || (path[path.length - 1] == '\\')) {
                return path;
            };

            return path + '/';
        }

        /** add a filename to a path */
        public static concat(path1:string, path2?:string, path3?:string):string {
            let p = path1;
            if (path2) {
                p = Path.addAnding(p) + path2;
            }

            if (path3) {
                p = Path.addAnding(p) + path3;
            }
            return p;
        }

        /** return the filename of a file path */
        public static getFileName(fullFileName:string):string {
            let pos = fullFileName.lastIndexOf("/");
            if (pos < 0) {
                return fullFileName;
            }

            if ((pos + 1) >= fullFileName.length) {
                return "";
            }

            return fullFileName.substr(pos + 1);
        }


        /** return the path of a filename */
        public static getPathName(fullFileName:string):string {
            let pos = fullFileName.lastIndexOf("/");
            if (pos <= 0) {
                return "";
            }

            return fullFileName.substr(0, pos);
        }

    }
}  