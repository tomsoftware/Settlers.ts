module Settlers {
	
	 export class DecodeSettlers {

		public static getReader(source:BinaryReader, size:number, offset:number = -1):BinaryReader {
	

			let araCrypt = new AraCrypt();

			if (offset >= 0) {
				source.setOffset(offset);
			}

			/// avoid reading behind eof
			let maxSize = Math.max(0, source.length - source.getOffset());
			size = Math.min(maxSize, size);

			/// set the settlers key
			araCrypt.reset(0x30313233, 0x34353637, 0x38393031);
			
			/// uncrypt
			let data = new Uint8Array(size);
			
			for(let i=0; i<size; i++) {
				data[i] = (source.readByte() ^ araCrypt.getNextKey()) & 0xFF;
			}

			 return new BinaryReader(data);
		 }

	 }
	 
}