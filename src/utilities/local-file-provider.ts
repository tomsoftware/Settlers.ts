import { BinaryReader } from '@/resources/file/binary-reader';
import { IFileProvider, IFileSource } from './file-manager';

class LocalFileFile implements IFileSource {
    private file: File;

    public get name(): string {
        return this.file.name;
    }

    public get path(): string {
        return (this.file as any).webkitRelativePath ?? this.file.name;
    }

    constructor(file: File) {
        this.file = file;
        Object.seal(this);
    }

    public async readBinary(): Promise<BinaryReader> {
        const data = await this.file.arrayBuffer();
        return new BinaryReader(data, 0, null, this.name);
    }
}

export class LocalFileProvider implements IFileProvider {
    private fileList: FileList;

    constructor(fileList: FileList) {
        this.fileList = fileList;
    }

    public async readFiles(): Promise<IFileSource[]> {
        const files: IFileSource[] = [];

        for (const f of this.fileList) {
            files.push(new LocalFileFile(f));
        }

        return files;
    }
}
