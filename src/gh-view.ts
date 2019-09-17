module Settlers {

    /** View for debugging the gh and gl files (.dil) */
    export class GhView {
        private log: LogHandler = new LogHandler("GhView");
        public elements: ElementProvider  = new ElementProvider();
        private rootPath: string;
        private ghFile: GhFileReader;
        private resourceProvider:ResourceFileProvier;


        constructor(rootPath: string) {
            this.rootPath = rootPath;
            this.resourceProvider = new ResourceFileProvier(Path.concat(this.rootPath, "Siedler4"), "Gfx", "gfx.lib");
        }


        /** load a new game/level */
        public load(fileName: string) {

            this.resourceProvider.loadBinary(fileName).then((b) => {
                this.ghFile = new GhFileReader(b);

                this.fillUiList(this.ghFile);

                this.log.debug("File: "+ fileName);
                this.log.debug(this.ghFile.toString());

            });
        };

        public showImage(id:string) {
            let cav = this.elements.get<HTMLCanvasElement>("showImage");

            if ((!cav) || (!cav.getContext)) {
                return;
            }

            let index = parseInt(id);
           
            let img = this.ghFile.getImage(index);

            cav.height = img.height;
            let context = cav.getContext('2d');
            context.putImageData(img.getImageData(), 0, 0);

        }


        private fillUiList(ghReader: GhFileReader) {
            let list = this.elements.get<HTMLSelectElement>("list");

            HtmlHelper.clearList(list);
            list.add(new Option("-- select image --"));
            
            let l = ghReader.getImageCount();

            for (let i = 0; i < l; i++) {
                let fileInfo = ghReader.getImage(i);
                
                let item = new Option(fileInfo.toString(), ""+ i);
                list.options.add(item);
            }
        }

    }
}
