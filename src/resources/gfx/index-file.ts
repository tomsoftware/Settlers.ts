import { BinaryReader } from '../file/binary-reader';
import { IndexFileItem } from './index-file-item';
import { ResourceFile } from './resource-file';

export class IndexFile extends ResourceFile {
    protected offsetTable: Int32Array;

    public get length(): number {
        return this.offsetTable.length;
    }

    public getItems(start: number, length?: number): IndexFileItem[] {
        const end = length == null ? this.length : start + length;
        const list: IndexFileItem[] = [];

        for (let i = start; i < end; i++) {
            const item = this.getItem(i);
            if (item) {
                list.push(item);
            }
        }

        return list;
    }

    public getItem(index: number): IndexFileItem | null {
        const offset = this.offsetTable[index];
        if (!offset) {
            return null;
        }

        const l = this.offsetTable.length;
        let lenght = -1;

        for (let i = index + 1; i < l; i++) {
            if (this.offsetTable[i]) {
                lenght = this.offsetTable[i] - offset;
                break;
            }
        }

        return {
            index,
            offset: (offset - 20) >> 2,
            lenght: lenght >> 2
        };
    }

    constructor(resourceReader: BinaryReader) {
        super();

        const reader = this.readResource(resourceReader);

        /// read the object offsets
        const imageCount = reader.length / 4;

        this.offsetTable = new Int32Array(imageCount);

        for (let i = 0; i < imageCount; i++) {
            this.offsetTable[i] = reader.readIntBE();
        }
    }
}
