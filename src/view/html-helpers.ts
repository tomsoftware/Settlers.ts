module Settlers {

    /** functions for manipulating html elements */
    export abstract class HtmlHelper {

        /** remove all Items of an optionList */
        public static clearList(selectbox:HTMLSelectElement): void {
            selectbox.options.length = 0;
        }
    }
}