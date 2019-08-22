module Settlers {

    /** access to html elements on this view */
    export class ElementProvider {

        private elements: {[key: string]: string} = {};

        private cleanKey(key:string):string {
            return key.trim().toLowerCase();
        }

        public register(key:string, elementId:string) {
            this.elements[this.cleanKey(key)] = elementId;
        }

        public get<T extends HTMLElement>(key:string):T {
            let id = this.elements[this.cleanKey(key)];
            if (!id) {
                return null;
            }

            return document.getElementById(id) as T;
            
        }
    }
}