import { Options, Vue } from 'vue-class-component';
import { ResourceFileProvider } from '@/resources/lib/resource-file-provider';
import { IGfxImage } from '@/resources/gfx/igfx-image';
import { Path } from '@/utilities/path';
import { BinaryReader } from '@/resources/file/binary-reader';
import { DilFileReader } from '@/resources/gfx/dil-file-reader';
import { GfxFileReader } from '@/resources/gfx/gfx-file-reader';
import { GilFileReader } from '@/resources/gfx/gil-file-reader';
import { JilFileReader } from '@/resources/gfx/jil-file-reader';
import { PaletteCollection } from '@/resources/gfx/palette-collection';
import { PilFileReader } from '@/resources/gfx/pil-file-reader';
import { LogHandler } from '@/utilities/log-handler';

import FileBrowser from '@/components/file-browser.vue';
import HexViewer from '@/components/hex-viewer.vue';

@Options({
	name: 'GfxView',
	components: {
		FileBrowser,
		HexViewer
	}
})
export default class GfxView extends Vue {
private log = new LogHandler('GfxView');
	public fileName: string | null = null;
	public gfxContent: IGfxImage[] = [];
	public selectedItem: IGfxImage | null = null;
	private resourceProvider = new ResourceFileProvider('gfx.lib');
	public gfxFile: GfxFileReader | null = null;

	public onFileSelect(fileName: string): void {
		this.fileName = fileName;
		this.load(fileName);
	}

	public pad(value:string, size:number): string {
		// convert to string
		const str = ('' + value + '').split(' ').join('\u00a0');
		const padSize = Math.max(0, size - str.length);
		return str + ('\u00a0'.repeat(padSize));
	}

	/** load a new gfx */
	public async load(gfxPath: string):Promise<void> {
		const fileId = Path.combine('gfx', Path.getFileNameWithoutExtension(gfxPath));

		const fileList: Promise<boolean>[] = [];
		fileList.push(this.resourceProvider.fileExists(fileId + '.pil'));
		fileList.push(this.resourceProvider.fileExists(fileId + '.jil'));

		const filesExist = await Promise.all(fileList);
		this.doLoad(fileId, filesExist[0], filesExist[1]);
	}

	/** load a new image */
	public async doLoad(fileId: string, usePil: boolean, useJil: boolean): Promise<void> {
		this.log.debug('Using .jil=' + useJil);

		const fileList: Promise<BinaryReader>[] = [];

		fileList.push(this.resourceProvider.loadBinary(fileId + '.gfx'));
		fileList.push(this.resourceProvider.loadBinary(fileId + '.gil'));

		if (usePil) {
			fileList.push(this.resourceProvider.loadBinary(fileId + '.pil'));
			fileList.push(this.resourceProvider.loadBinary(fileId + '.pa6'));
		} else {
			fileList.push(this.resourceProvider.loadBinary(fileId + '.pi4'));
			fileList.push(this.resourceProvider.loadBinary(fileId + '.p46'));
		}

		if (useJil) {
			fileList.push(this.resourceProvider.loadBinary(fileId + '.dil'));
			fileList.push(this.resourceProvider.loadBinary(fileId + '.jil'));
		}

		const files = await Promise.all(fileList);
		const gfx = files[0];
		const gil = files[1];
		const paletteIndex = files[2];
		const palette = files[3];

		const gfxIndexList = new GilFileReader(gil);
		const paletteIndexList = new PilFileReader(paletteIndex);
		const palletCollection = new PaletteCollection(palette, paletteIndexList);

		let directionIndexList: DilFileReader | null = null;
		let jobIndexList: JilFileReader | null = null;

		if (useJil) {
			directionIndexList = new DilFileReader(files[4]);
			jobIndexList = new JilFileReader(files[5]);
		}

		this.gfxFile = new GfxFileReader(gfx, gfxIndexList, jobIndexList, directionIndexList, palletCollection);

		this.gfxContent = this.fillGfxList(this.gfxFile);

		this.log.debug('File: ' + fileId);
		this.log.debug(gfxIndexList.toString());
		this.log.debug(this.gfxFile.toString());
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
