module Settlers {

    /** create a hex view */
    export class HexView {
        private content:string = "";

        private createHexLine(hexValues:string, asciiValues:string) {
            if (hexValues.length > 0) {
                return hexValues +"\t" + asciiValues +"\n"
            }
            else {
                return "";
            }
        }

        constructor(source:BinaryReader) {
            source.setOffset(0);
            
            let lineLetters = "";
            let lineHex = "";
            let length = 0;
            let result = "";

            while(!source.eof()) {
                let char = source.readByte();

                lineHex += (char < 16 ? "0" : "") + char.toString(16) +" ";
                lineLetters += String.fromCharCode(char);
                length++;

                if (length > 32) {
                    result += this.createHexLine(lineHex, lineLetters);
                    lineHex = "";
                    lineLetters = "";
                    length = 0;
                }
            }

            this.content = result + this.createHexLine(lineHex, lineLetters);
            
        }

        public toString():string {
            return this.content;
        }
    }
}