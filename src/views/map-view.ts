import { Options, Vue } from 'vue-class-component';
import { MapLoader } from '@/resources/map/map-loader';
import { OriginalMapFile } from '@/resources/map/original/original-map-file';
import { MapChunk } from '@/resources/map/original/map-chunk';
import { IMapLoader } from '@/resources/map/imap-loader';
import { Game } from '@/game/game';
import { FileManager, IFileSource } from '@/utilities/file-manager';
import { LogHandler } from '@/utilities/log-handler';

import FileBrowser from '@/components/file-browser.vue';
import RendererView from '@/components/renderer-viewer.vue';

@Options({
    name: 'MapView',
    props: {
        fileManager: Object
    },
    components: {
        FileBrowser,
        RendererView
    }
})
export default class MapView extends Vue {
    private static log = new LogHandler('MapView');
    public readonly fileManager!: FileManager;

    public fileName: string | null = null;
    public mapInfo = '';
    public game: Game | null = null;

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

    /** load a new game/level */
    public async load(file: IFileSource):Promise<void> {
        if (!this.fileManager) {
            return;
        }

        const fileData = await file.readBinary();
        if (!fileData) {
            MapView.log.error('unable to load ' + file.name);
            return;
        }

        const mapContent = MapLoader.getLoader(fileData);
        if (!mapContent) {
            MapView.log.error('file not found ' + file.name);
            return;
        }

        this.mapInfo = mapContent.toString();

        /// create a game object
        this.game = new Game(this.fileManager, mapContent);
    }

    private fillChunkList(map: OriginalMapFile) {
        const list: MapChunk[] = [];

        const count = map.getChunkCount();
        for (let i = 0; i < count; i++) {
            const chunk = map.getChunkByIndex(i);

            list.push(chunk);
        }

        return list;
    }
}
