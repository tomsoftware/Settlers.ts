
module Settlers {
    export class GfxImage {

        /** start of image data */
        public dataOffset:number;

        public headType:boolean;

        public imgType:number;
        /** width of the image */
        public width:number;
        /** height of the image */
        public height:number;
        /** left (x) offset to display the image */
        public left:number;
        /** top (y) offset to display the image */
        public top:number;

        public flag1:number;
        public flag2:number;

        public toString(): string {
            return "size: ("+ this.width +" x" + this.height +") "
                + "pos ("+ this.left +", "+ this.top +") "
                + "type "+ this.imgType +"; "
                + "data offset "+ this.dataOffset +"; "
                + "flags: "+ this.flag1 + " / "+ this.flag2
                +" heade Type: "+ this.headType;
        }
    }


}
