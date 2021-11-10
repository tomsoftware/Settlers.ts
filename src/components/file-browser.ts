import { FileManager, IFileSource } from '@/resources/file-manager';
import { Options, Vue } from 'vue-class-component';

@Options({
    name: 'FileBrowser',
    components: {
    },
    emits: {
        select: (fileName: string) => typeof fileName === 'string'
    },
    props: {
        // use | in filter to allow multiple filter patterns
        filter: String,
        fileManager: Object
    }
})
export default class FileBrowser extends Vue {
    public readonly fileManager!: FileManager;
    public readonly filter!: string;

    public selectedFile: IFileSource | null = null;
    public files: IFileSource[] = [];

    public async mounted():Promise<void> {
        await this.doFilter();
        this.$watch('filter', () => this.doFilter());
    }

    private async doFilter() {
        this.files = await this.fileManager.filter(this.filter);
    }

    public selectFile(): void {
        if (!this.selectedFile) {
            return;
        }

        this.$emit('select', this.selectedFile);
    }
}
