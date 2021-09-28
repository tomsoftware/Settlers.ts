import { Game } from '@/game/game';
import { LandscapeRenderer } from '@/game/renderer/landscape/landscape-renderer';
import { Renderer } from '@/game/renderer/renderer';
import { Options, Vue } from 'vue-class-component';

@Options({
    name: 'RendererView',
    components: {
    },
    props: {
        game: Object
    }
})
export default class RendererViewer extends Vue {
    public renderer!: Renderer;
    public game!:Game;

    public async mounted(): Promise<void> {
        const cav = this.$refs.cav as HTMLCanvasElement;
        this.renderer = new Renderer(cav);

        this.initRenderer();

        this.$watch('game', () => {
            this.initRenderer();
        });
    }

    private initRenderer() {
        if (!this.game) {
            return;
        }

        this.renderer.add(
            new LandscapeRenderer(
                this.renderer.textureManager,
                this.game.mapSize,
                this.game.groundType,
                this.game.groundHeight
            )
        );

        this.renderer.init();
    }
}
