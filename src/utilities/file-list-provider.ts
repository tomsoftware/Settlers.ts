import { IFileProvider, IFileSource } from '@/utilities/file-manager';
import { BinaryReader } from '@/resources/file/binary-reader';
import { RemoteFile } from '@/utilities/remote-file';
import { Path } from './path';

class FileListFile implements IFileSource {
    public name: string;
    public path: string;

    constructor(path: string) {
        this.name = Path.getFileName(path);
        this.path = path;

        Object.seal(this);
    }

    public readBinary(): Promise<BinaryReader> {
        const fileProvider = new RemoteFile();
        return fileProvider.loadBinary(this.path);
    }
}

export class FileListProvider implements IFileProvider {
    public baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async readFiles(): Promise<IFileSource[]> {
        const fileNames = await this.loadFileList();

        return fileNames.map((f) => new FileListFile(f));
    }

    private async loadFileList() {
        const fp = new RemoteFile(process.env.BASE_URL);
        const fileListText = await fp.loadString('file-list.txt');

        return fileListText
            .split(/\r?\n/)
            .map((f) => Path.fixPath(f));
    }
}
