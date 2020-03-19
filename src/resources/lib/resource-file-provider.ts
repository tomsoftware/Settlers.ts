module Settlers {
    /** provides resource files for the game
     *  tryes to get the file from lib and falls back to "loosely" file from "disk"
    */
    export class ResourceFileProvier {
        private subPath: string;
        private log: LogHandler = new LogHandler("ResourceFileProvier");
        private libFile: Promise<LibFileReader>;
        private fileProvider: FileProvider;

        constructor(rootPath: string, subPath: string, libFileName: string) {
            this.subPath = subPath;
            this.fileProvider = new FileProvider(rootPath);

            this.libFile = new Promise((resolve, reject) => {
                this.fileProvider.loadBinary(libFileName)
                    .then((b) => {
                        resolve(new LibFileReader(b));
                    }).catch((msg) => {
                        this.log.log("Unable to read lib file: " + msg);
                        reject(msg);
                    })
            });
        }

        /** check if file exists */
        public fileExists(fileName: string): Promise<boolean> {
            return new Promise((resolve, reject) => {
                this.loadBinary(fileName)
                    .then(() => resolve(true))
                    .catch(()  => resolve(false))
            })
        }

        /** load file from lib or from remote source */
        public loadBinary(fileName: string): Promise<BinaryReader> {
            let fullFileName = Path.concat(this.subPath, fileName);

            return new Promise((resolve, reject) => {
                this.libFile.then((lib) => {
                    let f = lib.getFileInfoByFileName(Path.getPathName(fullFileName), Path.getFileName(fullFileName), true);
                    if (f) {
                        resolve(f.getReader());
                        return;
                    }

                    this.fileProvider.loadBinary(fullFileName)
                        .then((b) => {
                            resolve(b);
                            return;
                        }).catch((msg) => {
                            this.log.log("Unable to read resource file: " + msg.statusText);
                            reject(msg);
                        })
                });
            });
        }
    }
}
