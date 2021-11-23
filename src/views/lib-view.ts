import { Options, Vue } from 'vue-class-component';
import { LibFileReader } from '@/resources/lib/lib-file-reader';
import { LibFileItem } from '@/resources/lib/lib-file-item';
import { BinaryReader } from '@/resources/file/binary-reader';

import FileBrowser from '@/components/file-browser.vue';
import HexViewer from '@/components/hex-viewer.vue';
import { FileManager, IFileSource } from '@/utilities/file-manager';

@Options({
    name: 'LibView',
    props: {
        fileManager: Object
    },
    components: {
        FileBrowser,
        HexViewer
    }
})
export default class LibView extends Vue {
    public readonly fileManager!: FileManager;
    public fileName: string | null = null;
    public libContent: LibFileItem[] = [];
    public selectedItem: LibFileItem | null = null;
    public selectedItemReader: BinaryReader | null = null;

    public onFileSelect(file: IFileSource): void {
        this.fileName = file.name;
        this.load(file);
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
    public async load(file: IFileSource):Promise<void> {
        const content = await file.readBinary();
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
