import { LandscapeType } from '../landscape-type';

export class TexturePoint {
    public t0: LandscapeType;
    public t1: LandscapeType;
    public t2: LandscapeType;

    constructor(t0: LandscapeType, t1: LandscapeType, t2: LandscapeType) {
        this.t0 = t0;
        this.t1 = t1;
        this.t2 = t2;
    }

    public getKey(): number {
        return this.t0 << 16 | this.t1 << 8 | this.t2;
    }

    public toString(): string {
        return LandscapeType[this.t0] + ', ' + LandscapeType[this.t1] + ', ' + LandscapeType[this.t2];
    }
}
