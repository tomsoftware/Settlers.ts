import { IFileProvider, IFileSource } from "./file-manager";
import { BinaryReader } from "./file/binary-reader";
import { FileProvider } from "./file/file-provider";

class FileListProviderFile implements IFileSource {
    public name: string;
    private fileProvider: FileProvider;

    constructor(fileProvider: FileProvider, name: string) {
        this.fileProvider = fileProvider;
        this.name = name;
    }

    public readBinary(): Promise<BinaryReader> {
        return this.fileProvider.loadBinary(this.name);
    }

}

/** provides files / data of file from a given file-name-list */
export class FileListProvider implements IFileProvider {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async readFiles(): Promise<IFileSource[]> {
        const fp = new FileProvider(this.baseUrl);
        const fileListText = await fp.loadString('file-list.txt');
        const fileList = fileListText.split(/\r?\n/);

        return fileList.map((name) => new FileListProviderFile(fp, name));
    } 

}