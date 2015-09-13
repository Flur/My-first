/**
 * Created by Flur on 12.09.2015.
 */
"use strict";
(function () {

    /*
     *   Utils Module
     * */
    const _U = {

        extend: function (a, b) {
            for (var key in a) {
                if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {
                    a[key] = b[key];
                }
            }
            return a;
        },

        noop: function () {
        },

        errorHandler: {
            shadersLoadingFailed: function(msg) {
                msg = msg || "";
                console.log("Could not load shader.\n" + msg);
            }
        },

        shadersUrls: {
            vertex: "./shaders/vs.vert",
            fragment: "./shaders/fs.frag"
        },

        loadShaders: function(shader, ajax, success) {
            ajax(success, this.errorHandler.shadersLoadingFailed, {
                url: this.shadersUrls[shader]
            })
        }
    };

    /*
     *   Module for AJAX requests
     * */
    var ajax = (function () {

        const DEFAULT_SETTINGS = {
            url: "",
            method: "GET",
            success: _U.noop,
            error: _U.noop
        };

        function serializeAjaxSettings(success, error, settings) {
            settings.success = success;
            settings.error = error;
            return _U.extend(DEFAULT_SETTINGS, settings);
        }

        function sendAjaxRequest(settings) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open(settings.method, settings.url, true);
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    settings.success(xmlHttp.response);
                } else if (xmlHttp.readyState == 4 && xmlHttp.status !== 200) {
                    settings.error(xmlHttp);
                }
            };
            xmlHttp.send();
        }

        return function (success, error, settings) {
            var serializedSettings = serializeAjaxSettings(success, error, settings);
            sendAjaxRequest(serializedSettings);
        }
    }());

    /*
     *   Main module
     * */
    window.onload = (function () {

        function loadVertexShader(success) {
            _U.loadShaders("vertex", ajax, success);
        }

        function loadFragmentShader(success) {
            _U.loadShaders("fragment", ajax, success);
        }

        function getWebGlContextByCanvas(id) {
            if (!id) {
                return null;
            }

            var canvas = document.getElementById(id);
            return canvas.getContext("webgl");
        }

        function main() {
            var gl = getWebGlContextByCanvas("canvas");

            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            gl.clear(gl.COLOR_BUFFER_BIT);

        }

        return main;
    }());

}());

