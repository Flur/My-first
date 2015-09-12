/**
 * Created by Flur on 12.09.2015.
 */
"use strict";
(function() {

    function getWebGlContextByCanvas(id) {
        if (!id) {
            return null;
        }

        var canvas = document.getElementById(id);
        return canvas.getContext("webgl");
    }

    function main() {
        var gl = getWebGlContextByCanvas("canvas");

        gl.clearColor(1.0, 1.0, 0.0, 0.1);

        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    window.onload = main;
}());