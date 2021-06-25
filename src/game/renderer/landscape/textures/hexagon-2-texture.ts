import { ILandscapeTexture, TextureBlockSize } from './i-landscape-texture';
import { LandscapeType } from '../landscape-type';
import { TexturePoint } from './texture-point';

export class Hexagon2Texture implements ILandscapeTexture {
	private x: number;
	private y: number;
	private outerType: LandscapeType;
	private innerType: LandscapeType;

	constructor(typeOut: LandscapeType, typeIn: LandscapeType, x: number, y: number) {
		this.y = y;
		this.x = x;
		this.outerType = typeOut;
		this.innerType = typeIn;
	}

	public getTextureA(tp: TexturePoint, x: number, y: number): [number, number] {
		if (tp.t1 === this.innerType) {
			return [this.x * TextureBlockSize, this.y * TextureBlockSize];
		} else if (tp.t2 === this.innerType) {
			return [this.x * TextureBlockSize, this.y * TextureBlockSize];
		} else {
			return [this.x * TextureBlockSize, this.y * TextureBlockSize];
		}
	}

	public getTextureB(tp: TexturePoint, x: number, y: number): [number, number] {
		if (tp.t1 === this.innerType) {
			return [this.x * TextureBlockSize, this.y * TextureBlockSize];
		} else if (tp.t2 === this.innerType) {
			return [this.x * TextureBlockSize, this.y * TextureBlockSize];
		} else {
			return [this.x * TextureBlockSize, this.y * TextureBlockSize];
		}
	}

	public getPattern(): TexturePoint[] {
		return [
			new TexturePoint(this.outerType, this.outerType, this.innerType),
			new TexturePoint(this.innerType, this.outerType, this.outerType),
			new TexturePoint(this.outerType, this.innerType, this.outerType)
		];
	}
}
