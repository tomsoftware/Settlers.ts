import { Options, Vue } from 'vue-class-component';
import { FileManager } from './resources/file-manager';
import { FileListProvider } from './utilities/file-list-provider';
import { LibFileProvider } from './utilities/lib-file-provider';

@Options({
    name: 'App'
})
export default class App extends Vue {
    protected fileManager: FileManager = new FileManager();

    public async mounted(): Promise<void> {
        this.fileManager = new FileManager();
        await this.fileManager.addSource(new FileListProvider(process.env.BASE_URL));
        await this.fileManager.addSource(new LibFileProvider(this.fileManager));
    }
}
