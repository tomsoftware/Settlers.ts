module Settlers {

    /** View for debugging the gfx files (.dil) */
    export class GfxView {
        private log: LogHandler = new LogHandler("GfxView");
        public elements: ElementProvider  = new ElementProvider();
        private rootPath: string;
        private gfxFile: GfxFileReader;

        constructor(rootPath: string) {
            this.rootPath = rootPath;
        }

        

        /** load a new game/level */
        public load(sourcePath: string) {
            let fileProvider = new FileProvider(this.rootPath);

            let gil = fileProvider.loadBinary(sourcePath + ".gil");
            let gfx = fileProvider.loadBinary(sourcePath + ".gfx");

            Promise.all([gil, gfx]).then((b) => {
                let gfxIndexList = new GilFileReader(b[0]);
                this.gfxFile = new GfxFileReader(b[1], gfxIndexList);

                this.fillUiList(this.gfxFile);
            });
        };

        

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
