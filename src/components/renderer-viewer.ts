import { LandscapeRenderer } from '@/game/renderer/landscape/landscape-renderer';
import { Renderer } from '@/game/renderer/renderer';
import { Options, Vue } from 'vue-class-component';

@Options({
  name: 'RendererView',
  components: {
  },
  props: {
  }
})
export default class RendererViewer extends Vue {
  public renderer!: Renderer;

  public async mounted():Promise<void> {
    const cav = this.$refs.cav as HTMLCanvasElement;
    this.renderer = new Renderer(cav);

    this.renderer.add(new LandscapeRenderer());

    this.renderer.init();
  }
}
