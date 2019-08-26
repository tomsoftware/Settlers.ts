module Settlers {


    /** Interface for map loaders */
    export interface IMapLoader {

        /** General information about the map*/
        general: GeneralMapInformation;

		/** return the size of the map */
		size : Size
    }
}