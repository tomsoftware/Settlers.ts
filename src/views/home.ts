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

    public mounted() {
        // add test here :-)
    }

    protected checkIsValidSettlers() {
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

        this.$emit('checkSetup');
    }
}
