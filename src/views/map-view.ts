import { Options, Vue } from 'vue-class-component';
import { FileProvider } from '@/resources/file/file-provider';
import { MapLoader } from '@/resources/map/map-loader';
import { OriginalMapFile } from '@/resources/map/original/original-map-file';
import { MapChunk } from '@/resources/map/original/map-chunk';
import { IMapLoader } from '@/resources/map/imap-loader';

import FileBrowser from '@/components/file-browser.vue';
import HexViewer from '@/components/hex-viewer.vue';
import RendererView from '@/components/renderer-viewer.vue';

@Options({
  name: 'MapView',
  components: {
    FileBrowser,
    HexViewer,
    RendererView
  }
})
export default class MapView extends Vue {
  public fileName: string | null = null;
  public mapInfo = '';
  public mapChunks: MapChunk[] = [];
  public selectedChunk: MapChunk | null = null;
  public mapContent: IMapLoader | null = null;

  public onFileSelect(fileName: string): void {
    this.fileName = fileName;
    this.load(fileName);
  }

  public pad(value:string, size:number) {
    // convert to string
    const str = ('' + value + '').split(' ').join('\u00a0');
    const padSize = Math.max(0, size - str.length);
    return str + ('\u00a0'.repeat(padSize));
  }

  /** load a new game/level */
  public async load(sourcePath: string):Promise<void> {
    const fileProvider = new FileProvider('');

    const file = await fileProvider.loadBinary(sourcePath);
    this.mapContent = MapLoader.getLoader(file);
    if (!this.mapContent) {
      return;
    }

    /// doing this for debug to dive into the object structure of the loader
    this.mapChunks = this.fillChunkList(this.mapContent as any as OriginalMapFile);

    this.mapInfo = this.mapContent.toString();
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
