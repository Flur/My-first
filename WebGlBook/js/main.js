/**
 * Created by Flur on 12.09.2015.
 */
"use strict";
(function() {
    function main() {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
        ctx.fillRect(0, 0, 800, 600);
    }
    window.onload = main;
}());