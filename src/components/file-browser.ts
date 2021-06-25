import { FileProvider } from '@/resources/file/file-provider';
import { Path } from '@/utilities/path';
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
		filter: String
	}
})
export default class FileBrowser extends Vue {
	public files: string[] = [];
	public selectedFile = '';
	readonly filter!: string;
	private fileList!: string[];

	public async mounted():Promise<void> {
		const fp = new FileProvider(process.env.BASE_URL);
		const fileListText = await fp.loadString('file-list.txt');
		this.fileList = fileListText.split(/\r?\n/);

		this.doFilter();

		this.$watch('filter', () => this.doFilter());
	}

	private doFilter() {
		const filterArray = (this.filter ?? '').split('|');

		this.files = this.fileList
			.filter((f) => filterArray.find((filter) => f.indexOf(filter) >= 0))
			.map((f) => Path.fixPath(f));
	}

	public selectFile():void {
		this.$emit('select', Path.combine(process.env.BASE_URL, this.selectedFile));
	}
}
