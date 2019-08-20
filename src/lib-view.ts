module Settlers {

    /** View for debugging the lib files */
    export class LibView {

        private log: LogHandler = new LogHandler("LibView");
        private rootPath: string;

        private listElement: HTMLSelectElement;
        private fileContentElement : HTMLElement;
        private fileInfoElement: HTMLElement;
        private libReader: LibFileReader;
        

        constructor(rootPath: string) {
            this.rootPath = rootPath;
        }

        public setFileListElement(listElement: HTMLSelectElement) {
            this.listElement = listElement;
        }

        public setFileContentElement(textElement: HTMLElement) {
            this.fileContentElement = textElement;
        }

        public setFileInfoElement(infoElement: HTMLElement) {
            this.fileInfoElement = infoElement;
        }

        private clearOptions(selectbox:HTMLSelectElement){
            for(let i = selectbox.options.length - 1 ; i >= 0 ; i--) {
                selectbox.remove(i);
            }
        }

        public showLibFile(fileIndex:string) {
            let fileInfo = this.libReader.getFileInfo(parseInt(fileIndex));

            let infoText = fileInfo.toString();

            if (!fileInfo.checkChecksum()) {
                infoText += "  -- Checksumm missmatch! --";
                this.log.log("Checksumm missmatch!");
            }

            let reader = fileInfo.getReader();

            this.fileInfoElement.innerText = infoText;
            this.fileContentElement.innerText = reader.readString();
        }

        private fillUiList(libReader: LibFileReader) {
            this.clearOptions(this.listElement);
            this.listElement.add(new Option("-- select file --"));
            
            let l = libReader.getFileCount();

            for (let i = 0; i < l; i++) {
                let fileInfo = libReader.getFileInfo(i);
                
                let item = new Option(fileInfo.getFullName() + " . . . . . . . . . . . . ["+ fileInfo.decompressedLength +"]", ""+ i);
                this.listElement.options.add(item);
            }
        }


        /** load a new game/level */
        public load(sourcePath: string) {
            let fileProvider = new FileProvider(this.rootPath);

            fileProvider.loadBinary(sourcePath).then((b) => {
                this.libReader = new LibFileReader(b);
                
                this.fillUiList(this.libReader);
            });
        };

    }



}
