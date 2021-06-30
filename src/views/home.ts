import { BinaryReader } from '@/resources/file/binary-reader';
import { Compression } from '@/resources/file/compress';
import { Decompress } from '@/resources/file/decompress';
import { Options, Vue } from 'vue-class-component';

@Options({
    name: 'Home',
    components: {
    }
})
export default class Home extends Vue {
    public mounted() {
        const srcText = 'Hallo World';
        const encoder = new TextEncoder();

        const buffer = new BinaryReader(encoder.encode(srcText));
        console.log(buffer);

        const comp = Compression.compress(buffer);

        console.log(comp);

        const unComp = new Decompress();
        const result = unComp.unpack(comp, 0, comp.length, srcText.length);

        console.log('cool: ' + result.readString());
    }
}
