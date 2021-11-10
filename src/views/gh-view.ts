import { Options, Vue } from 'vue-class-component';
import { GhFileReader } from '@/resources/gfx/gh-file-reader';
import { IGfxImage } from '@/resources/gfx/igfx-image';
import { ImageType } from '@/resources/gfx/image-type';
import { FileManager, IFileSource } from '@/resources/file-manager';

import FileBrowser from '@/components/file-browser.vue';
import HexViewer from '@/components/hex-viewer.vue';

@Options({
    name: 'GhView',
    props: {
        fileManager: Object
    },
    components: {
        FileBrowser,
        HexViewer
    }
})
export default class GhView extends Vue {
    public fileName: string | null = null;
    public readonly fileManager!: FileManager;
    public ghInfo = '';
    public ghContent: IGfxImage[] = [];
    public selectedItem: IGfxImage | null = null;

    public onFileSelect(file: IFileSource): void {
        this.fileName = file.name;
        this.load(file);
    }

    public pad(value:string, size:number): string {
        // convert to string
        const str = ('' + value + '').split(' ').join('\u00a0');
        const padSize = Math.max(0, size - str.length);
        return str + ('\u00a0'.repeat(padSize));
    }

    /** load a new gh */
    public async load(file: IFileSource):Promise<void> {
        const content = await file.readBinary();

        const ghFile = new GhFileReader(content);

        this.ghContent = this.fillGhList(ghFile);
        this.ghInfo = ghFile.toString();
    }

    public toImageTypeStr(imgType: ImageType): string {
        return ImageType[imgType];
    }

    private fillGhList(ghReader: GhFileReader):IGfxImage[] {
        const list: IGfxImage[] = [];

        const l = ghReader.getImageCount();

        for (let i = 0; i < l; i++) {
            const fileInfo = ghReader.getImage(i);

            if (fileInfo) {
                list.push(fileInfo);
            }
        }

        return list;
    }

    public onSelectItem(): void {
        const img = this.selectedItem;
        if (!img) {
            return;
        }

        const cav = this.$refs.ghCav as HTMLCanvasElement;
        if ((!cav) || (!cav.getContext)) {
            return;
        }

        cav.height = img.height;
        const context = cav.getContext('2d');

        if (!context) {
            return;
        }

        context.putImageData(img.getImageData(), 0, 0);
    }
}
