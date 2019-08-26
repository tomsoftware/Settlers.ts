module Settlers {


    /** Stores an ordered pair of integers, which specify a Height and Width */
    export class Size {

		public readonly width : number;
        public readonly height : number;
		
		public constructor(width:number, height:number) {
			this.width = width
			this.height = height;
		}

		public toString():string {
            return "size: ["+ this.width +" x "+  this.height + "]";
        }
    }
}