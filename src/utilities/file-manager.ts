import { Path } from '@/utilities/path';
import { BinaryReader } from '../resources/file/binary-reader';

export interface IFileSource {
    name: string;
    path: string;
    readBinary(): Promise<BinaryReader>;
}

export interface IFileProvider {
    readFiles(): Promise<IFileSource[]>;
}

export interface IFileProxyProvider {
    fileNameFilter: string;
    processFile(newFile: IFileSource): Promise<IFileSource[] | null>;
}

/** manages all files form all sources */
export class FileManager {
    private files: IFileSource[] = [];
    private proxys: IFileProxyProvider[] = [];

    public constructor() {
        Object.seal(this);
    }

    public async registerProxy(proxy: IFileProxyProvider): Promise<void> {
        // send all previous added files to proxy
        for (const f of this.files) {
            await this.callProxyie(proxy, f);
        }

        // register proxy
        this.proxys.push(proxy);
    }

    /** call a proxy with a new file */
    private async callProxyie(proxy: IFileProxyProvider, file: IFileSource) {
        if (!this.checkFileNameFilter(file.name, proxy.fileNameFilter, false)) {
            return;
        }

        const newFiles = await proxy.processFile(file);

        if (!newFiles) {
            return;
        }

        for (const newF of newFiles) {
            this.addFile(newF);
        }
    }

    /** add one file to the manager */
    private async addFile(file: IFileSource) {
        this.files.push(file);

        // call proxies
        for (const p of this.proxys) {
            await this.callProxyie(p, file);
        }
    }

    /** add an file provider that gain access to files */
    public async addSource(provider: IFileProvider): Promise<void> {
        const list = await provider.readFiles();

        for (const file of list) {
            this.addFile(file);
        }
    }

    /** compaire a given fileName to a given filter string */
    private checkFileNameFilter(fileName: string, filterName: string, exactMatch = true) {
        if (exactMatch) {
            return fileName.toLowerCase() === filterName.toLowerCase();
        }

        return fileName.toLowerCase().endsWith(filterName.toLowerCase());
    }

    /** return a file matching a given file name */
    public findFile(filePath: string, exactMatch = true): IFileSource | null {
        const file = this.files.find((f) => this.checkFileNameFilter(f.name, filePath, exactMatch));
        return file ?? null;
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
            .map((f) => Path.fixPath(f));

        return this.files
            .filter((f) => filterArray
                .find((filter) => this.checkFileNameFilter(f.name, filter, false))
            );
    }
}
