import { FileManager, IFileProvider, IFileSource } from '@/resources/file-manager';
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
export class LibFileProvider implements IFileProvider {
    private static logHandler = new LogHandler('LibFileProvider');
    private fileManager: FileManager;

    constructor(fileManager: FileManager) {
        this.fileManager = fileManager;
    }

    public async readFiles(): Promise<IFileSource[]> {
        const libFiles = await this.fileManager.filter('.lib');

        const files: IFileSource[] = [];

        for (const f of libFiles) {
            LibFileProvider.logHandler.debug('Read lib ' + f.name);

            const baseLibPath = Path.getPathName(f.name);

            const libFile = await f.readBinary();
            const reader = new LibFileReader(libFile);
            const count = reader.getFileCount();

            for (let i = 0; i < count; i++) {
                const file = reader.getFileInfo(i);
                files.push(new LibFileFile(file, baseLibPath));
            }
        }

        return files;
    }
}
