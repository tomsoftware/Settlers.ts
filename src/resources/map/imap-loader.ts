import { Size } from '@/utilities/size';
import { GeneralMapInformation } from './general-map-information';
import { IMapLandscape } from './imap-landscape';

/** Interface for map loaders */
export interface IMapLoader {
        landscape: IMapLandscape;

        /** General information about the map */
        general: GeneralMapInformation;

        /** return the size of the map */
        mapSize : Size;
}
