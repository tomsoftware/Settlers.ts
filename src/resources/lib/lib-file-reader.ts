import { LogHandler } from '@/utilities/log-handler';
import { BinaryReader } from '../file/binary-reader';
import { LibFileHeader } from './lib-file-header';
import { LibFileItem } from './lib-file-item';
import { PathList } from './path-list';

/** provides access to a settlers 4 lib file */
export class LibFileReader {
    private static log: LogHandler = new LogHandler('LibFileReader');
    private fileInfos: LibFileItem[] = [];
    private pathList?: PathList;
    private reader: BinaryReader;

    constructor(data: BinaryReader) {
        this.reader = data;

        this.processFile(data);

        Object.seal(this);
    }

    public getFileCount() : number {
        return (this.fileInfos) ? this.fileInfos.length : 0;
    }

    /** return the checksum for a given file index */
    public getChecksum(fileIndex: number): number {
        if ((fileIndex < 0) || (fileIndex >= this.fileInfos.length)) {
            return -1;
        }

        return this.fileInfos[fileIndex].checksum;
    }

    /** return the full path name for a given file index */
    public getFullPathName(fileIndex: number): string {
        if ((fileIndex < 0) || (fileIndex >= this.fileInfos.length)) {
            return '';
        }
        if (!this.pathList) {
            return '';
        }

        const info = this.fileInfos[fileIndex];

        return this.pathList.getPath(info.pathIndex) + '/' + info.fileName;
    }

    /** return the data for a given file */
    public getFileInfo(fileIndex:number): LibFileItem {
        return this.fileInfos[fileIndex];
    }

    /** return the data for a given file */
    public getFileInfoByFileName(pathName: string, fileName: string, quiet:boolean): LibFileItem | null {
        const index = this.getFileIndexFromFileName(pathName, fileName);
        if (index < 0) {
            if (!quiet) {
                LibFileReader.log.error('File not found: ' + pathName + ' / ' + fileName);
            }
            return null;
        }

        return this.getFileInfo(index);
    }

    /** find the index in this.fileInfos for a given path / file name */
    private getFileIndexFromFileName(pathName: string, filename: string): number {
        if (!this.pathList) {
            return -1;
        }

        const pathIndex = this.pathList.findPathIndex(pathName);
        if (pathIndex < 0) {
            return -1;
        }

        const file = filename.toUpperCase();
        for (let i = 0; i < this.fileInfos.length; i++) {
            if ((this.fileInfos[i].pathIndex === pathIndex) && (this.fileInfos[i].fileName.toUpperCase() === file)) {
                return i;
            }
        }

        return -1;
    }

    /** read the meta data of the file */
    private processFile(data: BinaryReader) {
        const offset = data.readIntBE(data.length - 4);

        const header = new LibFileHeader(data, offset);
        if (header.fileNameCount <= 0) {
            return;
        }

        LibFileReader.log.debug('Header-Info: ' + header);

        this.pathList = header.getPathList();
        this.fileInfos = header.getFileInfo();
        /*
            for (let i = 0; i < this.fileInfos.length; i++) {
                    console.log('' + this.fileInfos[i]);
            }
            */
    }
}
