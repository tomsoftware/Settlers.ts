import { FileListProvider } from '@/utilities/file-list-provider';
import { LogHandler } from '@/utilities/log-handler';
import { Path } from '@/utilities/path';
import { BinaryReader } from '../file/binary-reader';
import { FileProvider } from '../file/file-provider';
import { LibFileReader } from './lib-file-reader';

/** provides resource files for the game
         *    types to get the file from lib and falls back to "loosely" file from "disk"
        */
export class ResourceFileProvider {
        private log: LogHandler = new LogHandler('ResourceFileProvider');
        private libFile: Promise<LibFileReader> | null = null;
        private fileProvider: FileProvider;

        constructor(libFileName?: string) {
            this.fileProvider = new FileProvider();

            if (!libFileName) {
                return;
            }

            this.libFile = new Promise((resolve, reject) => {
                new FileListProvider().filter(libFileName)
                    .then((fullLibFileNameList) => {
                        if (fullLibFileNameList.length < 1) {
                            reject(new Error('Unable to resolve full path for: ' + libFileName));
                            return;
                        }

                        this.log.debug('full path for ' + libFileName + ' is: ' + fullLibFileNameList[0]);
                        return this.fileProvider.loadBinary(fullLibFileNameList[0]);
                    })
                    .then((b) => {
                        if (b) {
                            resolve(new LibFileReader(b));
                        }
                    }).catch((msg) => {
                        this.log.error('Unable to read lib file: ' + msg);
                        reject(msg);
                    });
            });

            Object.seal(this);
        }

        /** check if file exists */
        public fileExists(fileName: string): Promise<boolean> {
            return new Promise((resolve) => {
                this.loadBinary(fileName)
                    .then(() => resolve(true))
                    .catch(() => resolve(false));
            });
        }

        /** load file from lib or from remote source */
        public async loadBinary(fileName: string): Promise<BinaryReader> {
            if (this.libFile) {
                const lib = await this.libFile;
                const f = lib.getFileInfoByFileName(Path.getPathName(fileName), Path.getFileName(fileName), true);
                if (f) {
                    return f.getReader();
                }
            }

            this.log.debug('Not in lib: ' + fileName);

            const fileList = await (new FileListProvider()).filter(fileName);
            if (fileList.length <= 0) {
                throw (new Error('file not found ' + fileName));
            }

            return await this.fileProvider.loadBinary(fileList[0]);
        }
}
