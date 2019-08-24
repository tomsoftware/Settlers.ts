module Settlers {

    /** provides an game object to controle the game */
    export class MapView {

        public elements: ElementProvider = new ElementProvider();
        private log: LogHandler = new LogHandler("MapView");
        private rootPath: string;
        private mapFile: MapFile;
        private mapContent:IMapLoader;

        constructor(rootPath: string) {
            this.rootPath = rootPath;
        }

        public showSection(sectionIndex: string) {
            let section = this.mapFile.getChunkByIndex(parseInt(sectionIndex));

            let infoText = section.toString();

            if (!section.checkChecksum()) {
                infoText += "  -- Checksumm missmatch! --";
                this.log.log("Checksumm missmatch!");
            }

            this.elements.get<HTMLElement>("info").innerText = infoText;


            let data = section.getReader();

            if (this.elements.get<HTMLInputElement>("showHexView").checked) {
                this.elements.get<HTMLElement>("Content").innerText = new HexView(data).toString();
            }
            else if (this.elements.get<HTMLInputElement>("showTextView").checked) {
                this.elements.get<HTMLElement>("Content").innerText = data.readString();
            }
            else {
                let bytePerPixle = parseInt(this.elements.get<HTMLInputElement>("bytePerPixle").value);
                let byteOffset = parseInt(this.elements.get<HTMLInputElement>("byteOffset").value);
                this.displayImage(data, 
                    bytePerPixle,
                    byteOffset,
                    this.mapContent.general.mapWidth,
                    this.mapContent.general.mapHeight,
                    this.elements.get<HTMLCanvasElement>("showImage"));
            }

        }


        private displayImage(data:BinaryReader, bytePerPixle:number, byteOffset:number,width:number, height:number, cav:HTMLCanvasElement) {
            if ((!cav) || (!cav.getContext)) {
                return;
            }

            let img = new ImageData(width, height);
            let imgData = img.data;
  
            let buffer = data.getBuffer();
            let j = 0;
            let length = Math.min(buffer.length - byteOffset, width * height * bytePerPixle);

            for(let i=byteOffset; i < length; i+=bytePerPixle) {
                let value = buffer[i];

                imgData[j++] = value; // r
                imgData[j++] = value; // g
                imgData[j++] = value; // b
                imgData[j++] = value; // alpha
            }

            cav.height = height;
            let context = cav.getContext('2d');
            context.putImageData(img, 0, 0);
       
        }


        private fillSectionList(map: MapFile) {
            let list = this.elements.get<HTMLSelectElement>("list");

            HtmlHelper.clearList(list);
            list.add(new Option("-- select chunk --"));

            let count = map.getSectionCount();
            for (let i = 0; i < count; i++) {
                let chunk = map.getChunkByIndex(i);

                list.add(new Option(chunk.chunkType + " . . . . . . "
                    + "[size: " + chunk.unpackedLength + "]  "
                    + "Type: " + MapChunkType[chunk.chunkType], i + ""));
            }
        }


        /** load a new game/level */
        public load(sourcePath: string) {
            let fileProvider = new FileProvider(this.rootPath);

            fileProvider.loadBinary(sourcePath).then((b) => {
                this.mapFile = new MapFile(b);

                this.fillSectionList(this.mapFile);

                this.mapContent = this.mapFile.getMapLoader();

                this.elements.get<HTMLInputElement>("mapInfo").innerText = this.mapContent.toString();

            });

        };

    }



}
