import { Options, Vue } from 'vue-class-component';
import { IGfxImage } from '@/resources/gfx/igfx-image';
import { Path } from '@/utilities/path';
import { DilFileReader } from '@/resources/gfx/dil-file-reader';
import { GfxFileReader } from '@/resources/gfx/gfx-file-reader';
import { GilFileReader } from '@/resources/gfx/gil-file-reader';
import { JilFileReader } from '@/resources/gfx/jil-file-reader';
import { PaletteCollection } from '@/resources/gfx/palette-collection';
import { PilFileReader } from '@/resources/gfx/pil-file-reader';
import { LogHandler } from '@/utilities/log-handler';
import { FileManager, IFileSource } from '@/utilities/file-manager';

import FileBrowser from '@/components/file-browser.vue';
import HexViewer from '@/components/hex-viewer.vue';

@Options({
    name: 'GfxView',
    props: {
        fileManager: Object
    },
    components: {
        FileBrowser,
        HexViewer
    }
})
export default class GfxView extends Vue {
    private static log = new LogHandler('GfxView');
    public readonly fileManager!: FileManager;
    public fileName: string | null = null;
    public gfxContent: IGfxImage[] = [];
    public selectedItem: IGfxImage | null = null;
    public gfxFile: GfxFileReader | null = null;

    public get imageSize() {
        let sum = 0;
        for (const i of this.gfxContent) {
            sum += i.height * i.width;
        }
        return sum;
    }

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

        const gfxIndexList = new GilFileReader(files.gil);
        const paletteIndexList = new PilFileReader(files.paletteIndex);
        const palletCollection = new PaletteCollection(files.palette, paletteIndexList);

        let directionIndexList: DilFileReader | null = null;
        let jobIndexList: JilFileReader | null = null;

        if (files.jil.length) {
            directionIndexList = new DilFileReader(files.dil);
            jobIndexList = new JilFileReader(files.jil);
        }

        this.gfxFile = new GfxFileReader(files.gfx, gfxIndexList, jobIndexList, directionIndexList, palletCollection);

        this.gfxContent = this.fillGfxList(this.gfxFile);

        GfxView.log.debug('File: ' + fileId);
        GfxView.log.debug(gfxIndexList.toString());
        GfxView.log.debug(this.gfxFile.toString());
    }

    private fillGfxList(gfxReader: GfxFileReader):IGfxImage[] {
        const list: IGfxImage[] = [];

        const l = gfxReader.getImageCount();

        for (let i = 0; i < l; i++) {
            const img = gfxReader.getImage(i);
            if (img) {
                list.push(img);
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
