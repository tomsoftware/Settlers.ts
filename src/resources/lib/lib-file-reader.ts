
module Settlers {

    /** provides acces to a settlers 4 lib file */
    export class LibFileReader {
        private log: LogHandler = new LogHandler("LibFileReader");
        private fileInfos: LibFileItem[];
        private pathNames: string[];
        private reader: BinaryReader

        constructor(data: BinaryReader) {
            this.reader = data;

            this.processFile(data);
        }


        public getFileCount() {
            return this.fileInfos.length;
        }

        /** return the checksum for a given file index */
        public getChecksum(fileIndex: number) {
            if ((fileIndex < 0) || (fileIndex >= this.fileInfos.length)) {
                return "";
            }

            return this.fileInfos[fileIndex].checksum;
        }


        /** return the full path name for a given file index */
        public getFullPathName(fileIndex: number) {
            if ((fileIndex < 0) || (fileIndex >= this.fileInfos.length)) {
                return "";
            }

            let info = this.fileInfos[fileIndex];

            if ((info.pathIndex < 0) || (info.pathIndex >= this.pathNames.length)) {
                return "/??/" + info.fileName;
            }

            return this.pathNames[info.pathIndex] + "/" + info.fileName;
        }


        /** return the data for a given file */
        public getFileInfo(pathName: string, fileName: string): LibFileItem {
            let index = this.getFileIndexFromFileName(pathName, fileName);
            if (index < 0) {
                this.log.log("File not found: " + pathName + " / " + fileName);
            }

            return this.fileInfos[index];
        }

        /** find the index in this.fileInfos for a given path / file name*/
        private getFileIndexFromFileName(pathName: string, filename: string): number {
            let pathIndex = this.findPathIndex(pathName);
            if (pathIndex < 0) {
                return -1;
            }

            let file = filename.toUpperCase();
            for (let i = 0; i < this.fileInfos.length; i++) {
                if ((this.fileInfos[i].pathIndex == pathIndex) && (this.fileInfos[i].fileName.toUpperCase() == file)) {
                    return i;
                }
            }

            return -1;
        }


        /** find the index in this.pathNames for a given pathName */
        private findPathIndex(pathName: string): number {
            let path = pathName.toUpperCase().split("/").join("\\");

            for (let i = 0; i < this.pathNames.length; i++) {
                if (this.pathNames[i].toUpperCase() == path) {
                    return i;
                }
            }
            return -1;
        }


        /** read the meta data of the file */
        private processFile(data: BinaryReader) {

            let offset = data.readIntBE(data.length - 4);

            let header = new LibFileHeader(data, offset);
            if (header.fileNameCount <= 0) {
                return;
            }

            this.log.debug("Header-Info: " + header);

            this.pathNames = header.getPathes();
            this.fileInfos = header.getItems();

            for (let i = 0; i < this.fileInfos.length; i++) {
                console.log("" + this.fileInfos[i]);
            }
        }
    }
}