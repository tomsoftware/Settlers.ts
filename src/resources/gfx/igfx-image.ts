import { ImageType } from './image-type';

export interface IGfxImage {
		imageType: ImageType;
		getImageData(): ImageData;
		height: number;
		width: number;
		flag1: number;
		flag2: number;
		getDataSize(): number;

		/** start of image data */
		dataOffset: number;
}
