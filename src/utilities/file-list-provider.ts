import { IFileProvider, IFileSource } from '@/resources/file-manager';
import { BinaryReader } from '@/resources/file/binary-reader';
import { FileProvider } from '@/resources/file/file-provider';
import { Path } from './path';

class FileListFile implements IFileSource {
    public name: string;
    private baseUrl: string;

    constructor(fileName: string, baseUrl: string) {
        this.name = fileName;
        this.baseUrl = baseUrl;

        Object.seal(this);
    }

    public readBinary(): Promise<BinaryReader> {
        const fileProvider = new FileProvider();
        return fileProvider.loadBinary(this.name);
    }
}

export class FileListProvider implements IFileProvider {
    public baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async readFiles(): Promise<IFileSource[]> {
        const fileNames = await this.loadFileList();

        return fileNames.map((f) => new FileListFile(f, this.baseUrl));
    }

    private async loadFileList() {
        const fp = new FileProvider(process.env.BASE_URL);
        const fileListText = await fp.loadString('file-list.txt');

        return fileListText
            .split(/\r?\n/)
            .map((f) => Path.fixPath(f));
    }
}
