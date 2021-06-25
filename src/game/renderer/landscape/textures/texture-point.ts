import { LandscapeType } from "../landscape-type";

export class TexturePoint {
	public t1: LandscapeType;
	public t2: LandscapeType;
	public t3: LandscapeType;

	constructor(t1: LandscapeType, t2: LandscapeType, t3: LandscapeType) {
		this.t1 = t1;
		this.t2 = t2;
		this.t3 = t3;
	}

	public getKey(): number {
		return this.t1 << 16 | this.t2 << 8 | this.t3;
	}
}
