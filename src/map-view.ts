module Settlers {

    /** provides an game object to controle the game */
    export class MapView {

        public elements: ElementProvider = new ElementProvider();
        private log: LogHandler = new LogHandler("MapView");
        private rootPath: string;
        private originalMapFile: OriginalMapFile;
        private mapContent: IMapLoader;

        constructor(rootPath: string) {
            this.rootPath = rootPath;
        }

        public showChunk(sectionIndex: string) {
            let section = this.originalMapFile.getChunkByIndex(parseInt(sectionIndex));

            let infoText = section.toString();

            if (!section.checkChecksum()) {
                infoText += "  -- Checksumm missmatch! --";
                this.log.log("Checksumm missmatch!");
            }

            this.elements.get<HTMLElement>("info").innerText = infoText;


            let data = section.getReader();
            let content = this.elements.get<HTMLElement>("Content");

            if (this.elements.get<HTMLInputElement>("showHexView").checked) {
                content.innerText = new HexView(data).toString();
            }
            else if (this.elements.get<HTMLInputElement>("showTextView").checked) {
                this.elements.get<HTMLElement>("Content").innerText = data.readString();
            }
            else {
                content.innerText = "";
                
                let bytePerPixle = parseInt(this.elements.get<HTMLInputElement>("bytePerPixle").value);
                let byteOffset = parseInt(this.elements.get<HTMLInputElement>("byteOffset").value);
                this.displayImage(data,
                    bytePerPixle,
                    byteOffset,
                    this.mapContent.size.width,
                    this.mapContent.size.height,
                    this.elements.get<HTMLCanvasElement>("showImage"));
            }

        }


        private displayImage(data: BinaryReader, bytePerPixle: number, byteOffset: number, width: number, height: number, cav: HTMLCanvasElement) {
            if ((!cav) || (!cav.getContext)) {
                return;
            }

            if ((width > 5000) || (height > 5000)) {
                return;
            }

            let img = new ImageData(width, height);
            let imgData = img.data;

            let buffer = data.getBuffer();
            let j = 0;
            let length = Math.min(buffer.length - byteOffset, width * height * bytePerPixle);

            for (let i = byteOffset; i < length; i += bytePerPixle) {
                let value = buffer[i];

                imgData[j++] = value; // r
                imgData[j++] = value; // g
                imgData[j++] = value; // b
                imgData[j++] = 255; // alpha
            }

            cav.height = height;
            let context = cav.getContext('2d');
            context.putImageData(img, 0, 0);

        }


        private fillChunkList(map: OriginalMapFile) {
            let list = this.elements.get<HTMLSelectElement>("list");

            HtmlHelper.clearList(list);
            list.add(new Option("-- select chunk --"));

            let count = map.getChunkCount();
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

                this.mapContent = MapLoader.getLoader(b);

                /// doing this for debug to dive into the object structure of the loader
                this.originalMapFile = this.mapContent as any as OriginalMapFile;
                this.fillChunkList(this.originalMapFile);

                this.elements.get<HTMLInputElement>("mapInfo").innerText = this.mapContent.toString();

            });

        };

    }



}
