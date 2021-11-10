import { Path } from '@/utilities/path';
import { BinaryReader } from './file/binary-reader';

export interface IFileSource {
    name: string;
    readBinary(): Promise<BinaryReader>;
}

export interface IFileProvider {
    readFiles(): Promise<IFileSource[]>;
}

/** manages all files form all sources */
export class FileManager {
    private files: IFileSource[] = [];

    public constructor() {
        Object.seal(this);
    }

    public async addSource(provider: IFileProvider): Promise<void> {
        const list = await provider.readFiles();

        for (const file of list) {
            this.files.push(file);
            // console.log(file.name);
        }
    }

    /** return a file matching a given file name */
    public findFile(filePath: string, exactMatch = true): IFileSource | null {
        const n = filePath.toLowerCase();

        if (exactMatch) {
            const file = this.files.find((f) => f.name.toLowerCase() === n);
            return file ?? null;
        } else {
            const file = this.files.find((f) => f.name.toLowerCase().endsWith(n));
            return file ?? null;
        }
    }

    /** return the file content to a given file-name (full path) */
    public readFile(filePath: string, exactMatch = true): Promise<BinaryReader | null> {
        const f = this.findFile(filePath, exactMatch);
        if (!f) {
            return Promise.resolve(null);
        }

        return f.readBinary();
    }

    /** return a map of files content for a given file-name-map */
    public async readFiles(fileNames: { [key: string]: string }, exactMatch = true): Promise<{[key: string]: BinaryReader}> {
        const fileList: Promise<BinaryReader | null>[] = [];
        const fileKeys: string[] = [];

        for (const key of Object.keys(fileNames)) {
            const f = this.readFile(fileNames[key], exactMatch);
            fileList.push(f);
            fileKeys.push(key);
        }

        // wait for all files to be loaded
        const resultFiles = await Promise.all(fileList);

        const result: {[key: string]: (BinaryReader)} = {};

        for (let i = 0; i < fileKeys.length; i++) {
            result[fileKeys[i]] = resultFiles[i] ?? new BinaryReader();
        }

        // return the result file map
        return result;
    }

    /** return a all files matching a given filter string */
    public filter(filterStr?: string): IFileSource[] {
        const filterArray = (filterStr ?? '')
            .split('|')
            .map((f) => Path.fixPath(f).toUpperCase());

        const fileList = this.files;

        return fileList
            .filter((f) => {
                const fUpper = f.name.toUpperCase();
                return filterArray.find((filter) => fUpper.indexOf(filter) >= 0);
            });
    }
}
