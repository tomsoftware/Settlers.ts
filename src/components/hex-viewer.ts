import { BinaryReader } from '@/resources/file/binary-reader';
import { Options, Vue } from 'vue-class-component';

@Options({
    name: 'HexViewer',
    components: {
    },
    props: {
        value: Object,
        width: Number,
        height: Number
    }
})
export default class HexViewer extends Vue {
    public value?: BinaryReader;
    public width?: number;
    public height?: number;

    public useWidth = 128;
    public imagePointInfo = '';

    public bytePerPixel = 4;
    public byteOffset = 0;

    public isTrimmed = false;
    public doNotTrim = false;

    private mType = '';

    public get type(): string {
        return this.mType;
    }

    public set type(newType: string) {
        this.mType = newType + '';
        this.updateContent();
    }

    public showAll() {
        this.doNotTrim = true;
        this.updateContent();
    }

    public content = '';

    public async mounted(): Promise<void> {
        this.useWidth = this.width ?? 128;

        this.$watch('value', () => {
            this.doNotTrim = false;
            this.updateContent();
        });

        this.$watch('width', () => {
            this.useWidth = this.width ?? 128;
        });

        this.updateContent();
    }

    public onMouseMove(evt: MouseEvent) {
        if (!this.value) {
            return;
        }

        const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();
        const x = Math.trunc(evt.clientX - rect.left);
        const y = Math.trunc(evt.clientY - rect.top);

        this.imagePointInfo =
            ' x: ' + x +
            ' y: ' + y +
            ' value: ' + this.peekValue(
                this.value,
                x, y,
                this.bytePerPixel, this.byteOffset,
                this.useWidth ?? 1);
    }

    private peekValue(data: BinaryReader, x: number, y: number, bytePerPixel: number, byteOffset: number, width: number) {
        const intX = Math.floor(x);
        if ((intX < 0) || (intX >= width)) {
            return;
        }

        const buffer = data.getBuffer();

        const bufferPos = (Math.floor(x) + Math.floor(y) * width) * bytePerPixel + byteOffset;

        return buffer[bufferPos];
    }

    private updateContent() {
        if (!this.value) {
            this.content = '';
            return;
        }

        switch (this.mType) {
        case 'hex':
            this.content = this.toHex(this.value);
            break;
        case 'text':
            this.content = this.toText(this.value);
            break;
        case 'img':
            this.content = '';
            {
                const cav = this.$refs.cav as HTMLCanvasElement;
                this.toImg(
                    this.value,
                    this.bytePerPixel, this.byteOffset,
                    this.useWidth ?? 1, this.height ?? 1,
                    cav);
            }
            break;
        default:
            this.content = '';
        }
    }

    private toImg(data: BinaryReader, bytePerPixel: number, byteOffset: number, width: number, height: number, cav: HTMLCanvasElement) {
        if ((!cav) || (!cav.getContext)) {
            return;
        }

        if ((width > 5000) || (height > 5000)) {
            return;
        }

        const img = new ImageData(width, height);
        const imgData = img.data;

        const buffer = data.getBuffer();
        let j = 0;
        const length = Math.min(buffer.length - byteOffset, width * height * bytePerPixel);

        for (let i = byteOffset; i < length; i += bytePerPixel) {
            const value = buffer[i];

            imgData[j++] = value; // r
            imgData[j++] = value; // g
            imgData[j++] = value; // b
            imgData[j++] = 255; // alpha
        }

        cav.height = height;
        const context = cav.getContext('2d');
        if (!context) {
            return;
        }

        context.putImageData(img, 0, 0);
    }

    private createHexLine(hexValues: string, asciiValues: string) {
        if (hexValues.length > 0) {
            return hexValues + '\t' + asciiValues + '\n';
        } else {
            return '';
        }
    }

    private getMaxLengthAndSetTrimmed(source: BinaryReader) {
        if ((this.doNotTrim) || (source.length <= 10000)) {
            this.isTrimmed = false;
            return source.length;
        }

        this.isTrimmed = true;
        return 10000;
    }

    private toText(source: BinaryReader): string {
        const maxLen = this.getMaxLengthAndSetTrimmed(source);
        return source.readString(maxLen, 0);
    }

    private toHex(source: BinaryReader): string {
        let maxLen = this.getMaxLengthAndSetTrimmed(source);
        source.setOffset(0);

        let lineLetters = '';
        let lineHex = '';
        let length = 0;
        let result = '';

        while (!source.eof() && maxLen > 0) {
            maxLen--;

            const char = source.readByte();

            lineHex += (char < 16 ? '0' : '') + char.toString(16) + ' ';
            lineLetters += (char < 16) ? '' : String.fromCharCode(char);
            length++;

            if (length > 32) {
                result += this.createHexLine(lineHex, lineLetters);
                lineHex = '';
                lineLetters = '';
                length = 0;
            }
        }

        return result + this.createHexLine(lineHex, lineLetters);
    }
}
