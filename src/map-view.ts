module Settlers {

    /** provides an game object to controle the game */
    export class MapView {

        public elements: ElementProvider  = new ElementProvider();
        private log: LogHandler = new LogHandler("MapView");
        private rootPath: string;
        private mapFile: MapFile;
        

        constructor(rootPath: string) {
            this.rootPath = rootPath;
        }

        public showSection(sectionIndex:string) {
            let section = this.mapFile.getSection(parseInt(sectionIndex));

            let infoText = section.toString();

            if (!section.checkChecksum()) {
                infoText += "  -- Checksumm missmatch! --";
                this.log.log("Checksumm missmatch!");
            }

            let data = section.getReader();
            let content:string = "";

            if (this.elements.get<HTMLInputElement>("showHexView").checked){
                content = new HexView(data).toString();
            }
            else {
                content = data.readString();
            }

            this.elements.get<HTMLElement>("Content").innerText = content;
            this.elements.get<HTMLElement>("info").innerText =  infoText;
        }

        private clearOptions(selectbox:HTMLSelectElement){
            for(let i = selectbox.options.length - 1 ; i >= 0 ; i--) {
                selectbox.remove(i);
            }
        }


        private fillSectionList(map: MapFile) {
            let list = this.elements.get<HTMLSelectElement>("list");

            this.clearOptions(list);
            list.add(new Option("-- select section --"));

            let count = map.getSectionCount();
            for (let i=0; i<count; i++ ){
                let section = map.getSection(i);

                list.add(new Option(section.sectionType +" . . . . . . [size: "+ section.unpackedLength +"]", i +""));
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
