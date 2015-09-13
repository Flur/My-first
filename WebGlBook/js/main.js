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
        }
    };

    /*
     *   Module for common WebGl things
     *   such as load shader, etc.
     * */
    var webGl_utils = (function (){

        const _SHADERS_URLS = {
            vertex: "./shaders/vs.vert",
            fragment: "./shaders/fs.frag"
        };

        function loadShader(shader, ajax, success) {
            ajax(success, _U.errorHandler.shadersLoadingFailed, {
                url: _SHADERS_URLS[shader]
            })
        }

        function loadVertexShader(success, ajax) {
            loadShader("vertex", ajax, success);
        }

        function loadFragmentShader(success, ajax) {
            loadShader("fragment", ajax, success);
        }

        function loadShaders(gl, ajax) {
            loadFragmentShader(function(){}, ajax);
            loadVertexShader(function(){}, ajax);
        }

        function createShader(shaderCode, type) {

            // HERE I HAVE STTOPED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER, "shader-fs");
            var vertexShader = gl.createShader(gl.VERTEX_SHADER, "shader-vs");

            gl.shaderSource(fragmentShader, fragmentShaderCode);
            gl.shaderSource(vertexShader, vertexShaderCode);

            gl.compileShader(fragmentShader);
            gl.compileShader(vertexShader);
        }

        return {
            initShaders: function(gl, ajax) {

            }
        }
    }());

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

