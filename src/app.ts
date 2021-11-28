import { Options, Vue } from 'vue-class-component';
import { FileManager } from './utilities/file-manager';
import { FileListProvider } from './utilities/file-list-provider';
import { LibFileProvider } from './utilities/lib-file-provider';
import { LogHandler } from './utilities/log-handler';

@Options({
    name: 'App'
})
export default class App extends Vue {
    private static log = new LogHandler('App');
    protected fileManager: FileManager | null = null;

    public async mounted(): Promise<void> {
        App.log.debug('Starting...');

        const fileManager = new FileManager();

        await fileManager.addSource(new FileListProvider(process.env.BASE_URL));
        await fileManager.registerProxy(new LibFileProvider());

        this.fileManager = fileManager;

        App.log.debug('Read FileManager sources done!');
    }
}
