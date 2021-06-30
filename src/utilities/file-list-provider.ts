import { FileProvider } from '@/resources/file/file-provider';
import { Path } from './path';

export class FileListProvider {
        private static fileList: Promise<string[]>;

        constructor() {
            if (!FileListProvider.fileList) {
                FileListProvider.fileList = FileListProvider.loadFileList();
            }
        }

        private static async loadFileList() {
            const fp = new FileProvider(process.env.BASE_URL);
            const fileListText = await fp.loadString('file-list.txt');

            return fileListText
                .split(/\r?\n/)
                .map((f) => Path.fixPath(f));
        }

        public async filter(filterStr?: string): Promise<string[]> {
            const filterArray = (filterStr ?? '')
                .split('|')
                .map((f) => Path.fixPath(f).toUpperCase());

            const fileList = await FileListProvider.fileList;

            return fileList
                .filter((f) => {
                    const fUpper = f.toUpperCase();
                    return filterArray.find((filter) => fUpper.indexOf(filter) >= 0);
                });
        }
}
