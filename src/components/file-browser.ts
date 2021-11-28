import { FileManager, IFileSource } from '@/utilities/file-manager';
import { Options, Vue } from 'vue-class-component';

@Options({
    name: 'FileBrowser',
    components: {
    },
    emits: {
        select: (selectedFile: IFileSource) => typeof selectedFile === 'object'
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

    public mounted(): void {
        this.doFilter();
        this.$watch('filter', () => this.doFilter());
        this.$watch('fileManager', () => this.doFilter());
    }

    private doFilter() {
        if (!this.fileManager) {
            return;
        }

        this.files = this.fileManager.filter(this.filter);
    }

    public selectFile(): void {
        if (!this.selectedFile) {
            return;
        }

        this.$emit('select', this.selectedFile);
    }
}
