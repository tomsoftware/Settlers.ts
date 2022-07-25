import { Game } from '@/game/game';
import { LandscapeRenderer } from '@/game/renderer/landscape/landscape-renderer';
import { Renderer } from '@/game/renderer/renderer';
import { Options, Vue } from 'vue-class-component';

@Options({
    name: 'RendererViewer',
    components: {
    },
    props: {
        game: Object,
        debugGrid: Boolean
    }
})
export default class RendererViewer extends Vue {
    public renderer: Renderer | null = null;
    public game!:Game;
    protected debugGrid!: boolean;

    public async mounted(): Promise<void> {
        const cav = this.$refs.cav as HTMLCanvasElement;
        this.renderer = new Renderer(cav);

        this.initRenderer();

        this.$watch('game', () => {
            this.initRenderer();
        });
    }

    private initRenderer() {
        if ((this.game == null) || (this.renderer == null)) {
            return;
        }

        this.renderer.add(
            new LandscapeRenderer(
                this.game.fileManager,
                this.renderer.textureManager,
                this.game.mapSize,
                this.game.groundType,
                this.game.groundHeight,
                this.debugGrid
            )
        );

        this.renderer.init();
    }

    public unmounted(): void {
        if (this.renderer == null) {
            return;
        }

        this.renderer.destroy();
    }
}
