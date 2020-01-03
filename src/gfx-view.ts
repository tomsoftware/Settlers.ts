module Settlers {

    /** View for debugging the gfx files (.dil) */
    export class GfxView {
        private log: LogHandler = new LogHandler("GfxView");
        public elements: ElementProvider  = new ElementProvider();
        private rootPath: string;
        private gfxFile: GfxFileReader;
        private resourceProvider:ResourceFileProvier;


        constructor(rootPath: string) {
            this.rootPath = rootPath;
            this.resourceProvider = new ResourceFileProvier(Path.concat(this.rootPath, "Siedler4"), "Gfx", "gfx.lib");
        }


        /** load a new grafix */
        public load(fileId: string) {

            let gil = this.resourceProvider.loadBinary(fileId + ".gil");
            let gfx = this.resourceProvider.loadBinary(fileId + ".gfx");

            Promise.all([gil, gfx]).then((b) => {
                let gfxIndexList = new GilFileReader(b[0]);
                this.gfxFile = new GfxFileReader(b[1], gfxIndexList);

                this.fillUiList(this.gfxFile);


                this.log.debug("File: "+ fileId);
                this.log.debug(gfxIndexList.toString());
                this.log.debug(this.gfxFile.toString());

            });
        };

        public showImage(id:string) {
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
                
                let item = new Option(fileInfo.toString(), ""+ i);
                list.options.add(item);
            }
        }

    }
}
