module Settlers {

    /** provides an game object to controle the game */
    export class MapView {

        private log: LogHandler = new LogHandler("MapView");
        private rootPath: string;

        private listElement: HTMLSelectElement;
        private sectionContentElement : HTMLElement;
        private sectionInfoElement: HTMLElement;

        private mapFile: MapFile;
        

        constructor(rootPath: string) {
            this.rootPath = rootPath;
        }

        public setSectionListElement(listElement: HTMLSelectElement) {
            this.listElement = listElement;
        }

        public setSectionContentElement(textElement: HTMLElement) {
            this.sectionContentElement = textElement;
        }

        public setSectionInfoElement(infoElement: HTMLElement) {
            this.sectionInfoElement = infoElement;
        }

        public showSection(sectionIndex:string) {
            let section = this.mapFile.getSection(parseInt(sectionIndex));

            let infoText = section.toString();

            if (!section.checkChecksum()) {
                infoText += "  -- Checksumm missmatch! --";
                this.log.log("Checksumm missmatch!");
            }

            this.sectionContentElement.innerText = section.getReader().readString();
            this.sectionInfoElement.innerText = infoText;
        }

        private clearOptions(selectbox:HTMLSelectElement){
            for(let i = selectbox.options.length - 1 ; i >= 0 ; i--) {
                selectbox.remove(i);
            }
        }


        private fillSectionList(map: MapFile) {
            this.clearOptions(this.listElement);
            this.listElement.add(new Option("-- select section --"));

            let count = map.getSectionCount();
            for (let i=0; i<count; i++ ){
                let section = map.getSection(i);

                this.listElement.add(new Option(section.sectionType +" . . . . . . [size: "+ section.unpackedLength +"]", i +""));
            }
        }

        /** load a new game/level */
        public load(sourcePath: string) {
            let fileProvider = new FileProvider(this.rootPath);

            fileProvider.loadBinary(sourcePath).then((b) => {
                this.mapFile = new MapFile(b);

                this.fillSectionList(this.mapFile);
            });
            
        };

    }



}
