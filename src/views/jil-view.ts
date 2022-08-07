import { Options, Vue } from 'vue-class-component';
import { Path } from '@/utilities/path';
import { DilFileReader } from '@/resources/gfx/dil-file-reader';
import { GfxFileReader } from '@/resources/gfx/gfx-file-reader';
import { GilFileReader } from '@/resources/gfx/gil-file-reader';
import { JilFileReader } from '@/resources/gfx/jil-file-reader';
import { PaletteCollection } from '@/resources/gfx/palette-collection';
import { PilFileReader } from '@/resources/gfx/pil-file-reader';
import { LogHandler } from '@/utilities/log-handler';
import { FileManager, IFileSource } from '@/utilities/file-manager';
import { IndexFileItem } from '@/resources/gfx/index-file-item';

import FileBrowser from '@/components/file-browser.vue';
import HexViewer from '@/components/hex-viewer.vue';

@Options({
    name: 'JilView',
    props: {
        fileManager: Object
    },
    components: {
        FileBrowser,
        HexViewer
    }
})
export default class JilView extends Vue {
    private static log = new LogHandler('JilView');
    public readonly fileManager!: FileManager;

    protected doAnimation = true;
    private animationTimer = 0;

    public fileName: string | null = null;
    public jilList: IndexFileItem[] = [];
    public dilList: IndexFileItem[] = [];
    public gilList: IndexFileItem[] = [];

    public selectedJil: IndexFileItem | null = null;
    public selectedDil: IndexFileItem | null = null;
    public selectedGil: IndexFileItem | null = null;

    public gfxFileReader: GfxFileReader | null = null;

    public dilFileReader: DilFileReader | null = null;
    public gilFileReader: GilFileReader | null = null;

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

    /** load a new gfx */
    public async load(file: IFileSource):Promise<void> {
        if (!this.fileManager) {
            return;
        }

        const fileId = Path.getFileNameWithoutExtension(file.name);

        this.doLoad(fileId);
    }

    /** load a new image */
    public async doLoad(fileId: string): Promise<void> {
        const fileNameList: {[key: string]: string} = {};

        fileNameList.gfx = fileId + '.gfx';
        fileNameList.gil = fileId + '.gil';

        const pilFileExists = this.fileManager.findFile(fileId + '.pil', false);

        if (pilFileExists) {
            fileNameList.paletteIndex = fileId + '.pil';
            fileNameList.palette = fileId + '.pa6';
        } else {
            fileNameList.paletteIndex = fileId + '.pi4';
            fileNameList.palette = fileId + '.p46';
        }

        fileNameList.dil = fileId + '.dil';
        fileNameList.jil = fileId + '.jil';

        const files = await this.fileManager.readFiles(fileNameList, true);

        const paletteIndexList = new PilFileReader(files.paletteIndex);
        const palletCollection = new PaletteCollection(files.palette, paletteIndexList);

        this.dilFileReader = new DilFileReader(files.dil);
        this.gilFileReader = new GilFileReader(files.gil);
        const jilFileReader = new JilFileReader(files.jil);
        this.jilList = jilFileReader.getItems(0);

        this.gfxFileReader = new GfxFileReader(
            files.gfx,
            this.gilFileReader,
            jilFileReader,
            this.dilFileReader,
            palletCollection);

        JilView.log.debug('File: ' + fileId);
        // JilView.log.debug(this.gfxFile.toString());
    }

    public onSelectJil(): void {
        if ((!this.selectedJil) || (!this.dilFileReader)) {
            return;
        }

        this.dilList = this.dilFileReader.getItems(this.selectedJil.offset, this.selectedJil.lenght);
        this.selectedDil = this.dilList[0];
        this.onSelectDil();
    }

    public onSelectDil(): void {
        if ((!this.selectedDil) || (!this.gilFileReader)) {
            return;
        }

        this.gilList = this.gilFileReader.getItems(this.selectedDil.offset, this.selectedDil.lenght);
        this.selectedGil = this.gilList[0];
        this.onSelectGil();
    }

    public onSelectGil(): void {
        if ((!this.selectedGil) || (!this.gfxFileReader) || (!this.selectedJil) || (!this.gilFileReader)) {
            return;
        }

        const offset = this.gilFileReader.getImageOffset(this.selectedGil.index);
        const gfx = this.gfxFileReader.readImage(offset, this.selectedJil.index);
        if (!gfx) {
            return;
        }

        const img = gfx.getImageData();
        const cav = this.$refs.ghCav as HTMLCanvasElement;
        if ((!cav) || (!cav.getContext)) {
            return;
        }

        cav.height = img.height;
        const context = cav.getContext('2d');

        if (!context) {
            return;
        }

        context.putImageData(img, 0, 0);
    }

    private onAnimate() {
        if ((this.gilList == null) || (!this.gilList.length) || (!this.doAnimation)) {
            return;
        }

        const nextFrameIndex = (this.gilList.findIndex((f) => f === this.selectedGil) + 1) % this.gilList.length;
        this.selectedGil = this.gilList[nextFrameIndex];
        this.onSelectGil();
    }

    public mounted(): void {
        this.animationTimer = window.setInterval(() => this.onAnimate(), 100);
    }

    public unmounted(): void {
        window.clearInterval(this.animationTimer);
    }
}
