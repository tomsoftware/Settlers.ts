import { IFileProxyProvider, IFileSource } from '@/utilities/file-manager';
import { BinaryReader } from '@/resources/file/binary-reader';
import { LibFileItem } from '@/resources/lib/lib-file-item';
import { LibFileReader } from '@/resources/lib/lib-file-reader';
import { LogHandler } from './log-handler';
import { Path } from './path';

class LibFileFile implements IFileSource {
    private libFileItem: LibFileItem;
    private baseLibPath: string;

    public get name(): string {
        return Path.combine(this.baseLibPath, this.libFileItem.getFullName());
    }

    constructor(libFileItem: LibFileItem, baseLibPath: string) {
        this.libFileItem = libFileItem;
        this.baseLibPath = baseLibPath;

        Object.seal(this);
    }

    public async readBinary(): Promise<BinaryReader> {
        return this.libFileItem.getReader();
    }
}

/** provides access to files in a .lib */
export class LibFileProvider implements IFileProxyProvider {
    private static logHandler = new LogHandler('LibFileProvider');
    public fileNameFilter = '.lib';

    public async processFile(newFiles: IFileSource): Promise<IFileSource[] | null> {
        if (!newFiles) {
            return null;
        }

        LibFileProvider.logHandler.debug('Read lib ' + newFiles.name);

        const baseLibPath = Path.getPathName(newFiles.name);

        const libFile = await newFiles.readBinary();
        const reader = new LibFileReader(libFile);
        const count = reader.getFileCount();

        const files: IFileSource[] = [];

        for (let i = 0; i < count; i++) {
            const file = reader.getFileInfo(i);
            files.push(new LibFileFile(file, baseLibPath));
        }

        return files;
    }
}
