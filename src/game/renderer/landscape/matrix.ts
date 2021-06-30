export class Matrix {
    public mat;

    public constructor(mat: Float32Array) {
        this.mat = mat;
    }

    /** return a new matrix that is translated by (tx, ty, tz) */
    public translate(tx: number, ty: number, tz: number): Matrix {
        const dst = new Float32Array(16);
        const src = this.mat;

        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = src[2];
        dst[3] = src[3];
        dst[4] = src[4];
        dst[5] = src[5];
        dst[6] = src[6];
        dst[7] = src[7];
        dst[8] = src[8];
        dst[9] = src[9];
        dst[10] = src[10];
        dst[11] = src[11];
        dst[12] = src[12] + tx;
        dst[13] = src[13] + ty;
        dst[14] = src[14] + tz;
        dst[15] = src[15];

        return new Matrix(dst);
    }

    /** return a new matrix that is scaled by (dx, dy, dz) */
    public scale(dx: number, dy: number, dz: number): Matrix {
        const dst = new Float32Array(16);
        const src = this.mat;

        dst[0] = src[0] * dx;
        dst[1] = src[1];
        dst[2] = src[2];
        dst[3] = src[3];
        dst[4] = src[4];
        dst[5] = src[5] * dy;
        dst[6] = src[6];
        dst[7] = src[7];
        dst[8] = src[8];
        dst[9] = src[9];
        dst[10] = src[10] * dx;
        dst[11] = src[11];
        dst[12] = src[12];
        dst[13] = src[13];
        dst[14] = src[14];
        dst[15] = src[15];

        return new Matrix(dst);
    }

    /** Creates a 4-by-4 orthographic projection matrix */
    public static createOrthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix {
        const mat = new Float32Array(16);

        mat[0] = 2 / (right - left);
        mat[1] = 0;
        mat[2] = 0;
        mat[3] = 0;
        mat[4] = 0;
        mat[5] = 2 / (top - bottom);
        mat[6] = 0;
        mat[7] = 0;
        mat[8] = 0;
        mat[9] = 0;
        mat[10] = 2 / (near - far);
        mat[11] = 0;
        mat[12] = (left + right) / (left - right);
        mat[13] = (bottom + top) / (bottom - top);
        mat[14] = (near + far) / (near - far);
        mat[15] = 1;

        return new Matrix(mat);
    }
}
