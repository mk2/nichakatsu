/**
 * Created by lycaon on 2015/01/02.
 */

(function () {
    mozutil = {
        getXMLHttpRequest: function () {
            return new XMLHttpRequest( { mozSystem: true } )
        }
    };
})();
