module Settlers {

    /** View for debugging the gfx files (.dil) */
    export class GfxView {
        private log: LogHandler = new LogHandler("GfxView");
        public elements: ElementProvider = new ElementProvider();
        private rootPath: string;
        private gfxFile: GfxFileReader;
        private resourceProvider: ResourceFileProvier;

        constructor(rootPath: string) {
            this.rootPath = rootPath;
            this.resourceProvider = new ResourceFileProvier(Path.concat(this.rootPath, "Siedler4"), "Gfx", "gfx.lib");
        }




        /** load a new grafix */
        public load(fileId: string) {

            const fileList: Promise<boolean>[] = [];
            fileList.push(this.resourceProvider.fileExists(fileId + ".pil"));
            fileList.push(this.resourceProvider.fileExists(fileId + ".jil"));
            

            Promise.all(fileList).then((filesExist) => {
                this.doLoad(fileId, filesExist[0], filesExist[1]);
            });
        }


        /** load a new grafix */
        public doLoad(fileId: string, usePil: boolean, useJil: boolean) {

            this.log.debug("Using .jil=" + useJil);

            const fileList: Promise<BinaryReader>[] = [];

            fileList.push(this.resourceProvider.loadBinary(fileId + ".gfx"));
            fileList.push(this.resourceProvider.loadBinary(fileId + ".gil"));

            if (usePil) {
                fileList.push(this.resourceProvider.loadBinary(fileId + ".pil"));
                fileList.push(this.resourceProvider.loadBinary(fileId + ".pa6"));
            }
            else {
                fileList.push(this.resourceProvider.loadBinary(fileId + ".pi4"));
                fileList.push(this.resourceProvider.loadBinary(fileId + ".p46"));
            }

            if (useJil) {
                fileList.push(this.resourceProvider.loadBinary(fileId + ".dil"));
                fileList.push(this.resourceProvider.loadBinary(fileId + ".jil"));
            }


            Promise.all(fileList).then((files) => {
                const gfx = files[0];
                const gil = files[1];
                const paletteIndex = files[2];
                const palette = files[3];

                const gfxIndexList = new GilFileReader(gil);
                const paletteIndexList = new PilFileReader(paletteIndex);
                const palletCollection = new PaletCollection(palette, paletteIndexList);

                let directionIndexList: DilFileReader = null;
                let jobIndexList: JilFileReader = null;

                if (useJil) {
                    directionIndexList = new DilFileReader(files[4]);
                    jobIndexList = new JilFileReader(files[5]);
                }

                this.gfxFile = new GfxFileReader(gfx, gfxIndexList, jobIndexList, directionIndexList, palletCollection);


                this.fillUiList(this.gfxFile);


                this.log.debug("File: " + fileId);
                this.log.debug(gfxIndexList.toString());
                this.log.debug(this.gfxFile.toString());

            });
        };

        public showImage(id: string) {
            let cav = this.elements.get<HTMLCanvasElement>("showImage");

            if ((!cav) || (!cav.getContext)) {
                return;
            }

            let index = parseInt(id);
            let img = this.gfxFile.getImage(index);

            cav.height = img.height;
            let context = cav.getContext('2d');
            context.putImageData(img.getImageData(), 0, 0);

        }


        private fillUiList(gfxReader: GfxFileReader) {
            let list = this.elements.get<HTMLSelectElement>("list");

            HtmlHelper.clearList(list);
            list.add(new Option("-- select image --"));

            let l = gfxReader.getImageCount();

            for (let i = 0; i < l; i++) {
                let fileInfo = gfxReader.getImage(i);

                let item = new Option(fileInfo.toString(), "" + i);
                list.options.add(item);
            }
        }

    }
}
