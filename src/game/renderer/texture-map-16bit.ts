import { GfxImage16Bit } from '@/resources/gfx/gfx-image-16bit';
import { LogHandler } from '@/utilities/log-handler';
import { ShaderTexture } from './shader-texture';

export class TextureMapImage {
    private imgData: Uint16Array;
    private imgWidthHeight: number;
    /** the x-position in the texture this image is placed */
    public x: number;
    /** the x-position in the texture this image is placed */
    public y: number;
    public width: number;
    public height: number;

    constructor(imgData: Uint16Array, imgWidthHeight: number, x: number, y: number, width: number, height: number) {
        this.imgData = imgData;
        this.imgWidthHeight = imgWidthHeight;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public copyFrom(srcImg: GfxImage16Bit, srcX: number, srcY: number, width: number, height: number): void {
        const img = srcImg.getRaw16BitImage();

        for (let y = 0; y < height; y++) {
            const srcOffset = (srcY + y) * srcImg.width + srcX;
            const destOffset = (this.y + y) * this.imgWidthHeight + this.x;
            for (let x = 0; x < width; x++) {
                this.imgData[destOffset + x] = img[srcOffset + x];
            }
        }
    }
}

class Slot {
    public x = 0;
    public y: number;
    public height: number;
    public width: number;

    /** return the width that is left in the slot */
    public get leftSize() {
        return this.width - this.x;
    }

    /** return the bottom positon of the slot */
    public get buttom() {
        return this.y + this.height;
    }

    constructor(y: number, width: number, height: number) {
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /** reserve some width of the slot */
    public increase(width: number) {
        this.x += width;
    }
}

/**
 * A big texture buffer where images can write to
 **/
export class TextureMap16Bit extends ShaderTexture {
    private static log = new LogHandler('TextureMap');
    private imgData: Uint16Array;
    /** the size of the texture map. width and height are equeal! */
    public widthHeight: number;
    /*
    * every slot is 256 pixle height so y=index*256
    * the value of slotPosX is the position in x
    */
    private slots: Slot[] = [];

    constructor(widthHeight: number, textureIndex: number) {
        super(textureIndex);

        this.widthHeight = widthHeight;
        this.imgData = new Uint16Array(widthHeight * widthHeight);

        const numberOfPixles = widthHeight * widthHeight;
        for (let i = 0; i < numberOfPixles; i++) {
            this.imgData[i] = 0xF81F;
        }

        // reserve the 0/0 position as null slot
        const nullSlot = new Slot(0, this.widthHeight, 256);
        this.slots.push(nullSlot);
        nullSlot.increase(256);

        Object.seal(this);
    }

    /** declare an image of the given size within the texture map */
    public reserve(width: number, height: number): TextureMapImage | null {
        // find existing slot that can be used for the image
        let slot = this.slots.find((s) => s.height === height && s.leftSize >= width);
        if (slot == null) {
            // create new slot
            const freeY = this.slots[this.slots.length - 1]?.buttom ?? 0;
            slot = new Slot(freeY, this.widthHeight, width);
            this.slots.push(slot);
        }

        const newImg = new TextureMapImage(
            this.imgData,
            this.widthHeight,
            slot.x,
            slot.y,
            width,
            height
        );

        slot.increase(width);

        return newImg;
    }

    public load(gl: WebGLRenderingContext): void {
        const level = 0;
        const internalFormat = gl.RGB;
        const width = this.widthHeight;
        const height = this.widthHeight;
        const border = 0;
        const format = gl.RGB;
        const type = gl.UNSIGNED_SHORT_5_6_5;

        super.bind(gl);

        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
            format, type, this.imgData);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}
