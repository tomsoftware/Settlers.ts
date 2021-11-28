import { FileManager } from '@/utilities/file-manager';
import { LocalFileProvider } from '@/utilities/local-file-provider';
import { Options, Vue } from 'vue-class-component';

@Options({
    name: 'Home',
    props: {
        fileManager: Object
    },
    components: {
    }
})
export default class Home extends Vue {
    public readonly fileManager!: FileManager;
    protected isValidSettlers = false;

    public mounted(): void {
        this.$watch('fileManager', () => {
            this.checkIsValidSettlers();
        });

        // check if settlers files are provided
        this.checkIsValidSettlers();
    }

    protected checkIsValidSettlers(): void {
        if (!this.fileManager) {
            this.isValidSettlers = false;
            return;
        }

        this.isValidSettlers = this.fileManager.findFile('game.lib', false) != null;
    }

    protected async selectFiles(e: Event): Promise<void> {
        if ((!e) || (!e.target)) {
            return;
        }

        const files = (e.target as HTMLInputElement).files;
        if ((!files)) {
            return;
        }

        await this.fileManager.addSource(new LocalFileProvider(files));

        this.checkIsValidSettlers();
    }
}
