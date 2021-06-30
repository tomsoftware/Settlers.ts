
/**
 *     This Class is uses to decrypted game content (used in the map files of settler 4). It is a BINARY SAVE
 *    Version of the "ARA Crypt" -> see "Stream Encryption" by Warren Ward. Cause we only want to decode this
 *    files, the _keyState is initialized with the key used with settler 4
*/
export class AraCrypt {
    private keyState: Uint32Array = new Uint32Array(3);

    constructor() {
        Object.seal(this);
    }

    public reset(key0: number, key1: number, key2: number):void {
        // - settler 4 specific value/key
        this.keyState[0] = key0;
        this.keyState[1] = key1;
        this.keyState[2] = key2;
    }

    public getNextKey() :number {
        let key0 = this.keyState[0];
        let key1 = this.keyState[1];
        let key2 = this.keyState[2];

        let resultKey = 0;
        let bit1 = key1 & 1;
        let bit2 = key2 & 1;

        const KEY_MASK_A = 0x80000062;
        const KEY_MASK_B = 0x40000020;
        const KEY_MASK_C = 0x10000002;

        const KEY_ROT0_A = 0x7FFFFFFF;
        const KEY_ROT0_B = 0x3FFFFFFF;
        const KEY_ROT0_C = 0x0FFFFFFF;

        const KEY_ROT1_A = 0x80000000;
        const KEY_ROT1_B = 0xC0000000;
        const KEY_ROT1_C = 0xF0000000;

        for (let c = 0; c < 8; c++) {
            if ((key0 & 1) !== 0) {
                key0 = ((KEY_MASK_A ^ key0) >> 1) | KEY_ROT1_A;

                if ((key1 & 1) !== 0) {
                    key1 = ((KEY_MASK_B ^ key1) >> 1) | KEY_ROT1_B;
                    bit1 = 1;
                } else {
                    key1 = (key1 >> 1) & KEY_ROT0_B;
                    bit1 = 0;
                }
            } else {
                key0 = (key0 >> 1) & KEY_ROT0_A;

                if ((key2 & 1) !== 0) {
                    key2 = ((KEY_MASK_C ^ key2) >> 1) | KEY_ROT1_C;
                    bit2 = 1;
                } else {
                    key2 = (key2 >> 1) & KEY_ROT0_C;
                    bit2 = 0;
                }
            }

            resultKey = (bit2 ^ bit1) | (resultKey << 1);
        }

        // - save back the key:
        this.keyState[0] = key0;
        this.keyState[1] = key1;
        this.keyState[2] = key2;

        // - return the next key to use with XOR
        return resultKey;
    }
}
