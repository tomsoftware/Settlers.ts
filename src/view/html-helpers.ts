module Settlers {

    /** functions for manipulating html elements */
    export abstract class HtmlHelper {

        /** remove all Items of an optionList */
        public static clearList(selectbox:HTMLSelectElement): void {
            for(let i = selectbox.options.length - 1 ; i >= 0 ; i--) {
                selectbox.remove(i);
            }
        }
    }
}