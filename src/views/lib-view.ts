import { Options, Vue } from 'vue-class-component';
import { FileProvider } from '@/resources/file/file-provider';
import { LibFileReader } from '@/resources/lib/lib-file-reader';
import { LibFileItem } from '@/resources/lib/lib-file-item';

import FileBrowser from '@/components/file-browser.vue';
import HexViewer from '@/components/hex-viewer.vue';
import { BinaryReader } from '@/resources/file/binary-reader';

@Options({
    name: 'LibView',
    components: {
        FileBrowser,
        HexViewer
    }
})
export default class LibView extends Vue {
    public fileName: string | null = null;
    public libContent: LibFileItem[] = [];
    public selectedItem: LibFileItem | null = null;
    public selectedItemReader: BinaryReader | null = null;

    public onFileSelect(fileName: string): void {
        this.fileName = fileName;
        this.load(fileName);
    }

    public onSelectItem() {
        if (!this.selectedItem) {
            this.selectedItemReader = null;
            return;
        }

        this.selectedItemReader = this.selectedItem.getReader();
    }

    public pad(value:string, size:number): string {
        // convert to string
        const str = ('' + value + '').split(' ').join('\u00a0');
        const padSize = Math.max(0, size - str.length);
        return str + ('\u00a0'.repeat(padSize));
    }

    /** load a new lib */
    public async load(sourcePath: string):Promise<void> {
        const fileProvider = new FileProvider();

        const content = await fileProvider.loadBinary(sourcePath);
        const libReader = new LibFileReader(content);

        this.libContent = this.fillLibList(libReader);
    }

    private fillLibList(libReader: LibFileReader):LibFileItem[] {
        const list: LibFileItem[] = [];

        const l = libReader.getFileCount();

        for (let i = 0; i < l; i++) {
            const fileInfo = libReader.getFileInfo(i);

            list.push(fileInfo);
        }

        return list;
    }
}
