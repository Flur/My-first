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
            shadersLoadingFailed: function (msg) {
                msg = msg || "";
                console.log("Could not load shader.\n" + msg);
            }
        }
    };

    /*
     *   Module for common WebGl things
     *   such as load shader, etc.
     * */
    var webGl_utils = (function () {

        const _SHADERS_URLS = {
            vertex: "./shaders/vs.vert",
            fragment: "./shaders/fs.frag"
        };

        function checkShaderCompilationStatus(shader, gl) {
            var shaderStatus = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!shaderStatus) {
                throw "shader + :" + gl.getShaderInfoLog(shader);
            }
            return shaderStatus;
        }

        function loadShader(shader, ajax, success) {
            ajax(success, _U.errorHandler.shadersLoadingFailed, {
                url: _SHADERS_URLS[shader],
                // if true compilation error
                async: false
            })
        }

        function loadVertexShader(success, ajax) {
            loadShader("vertex", ajax, success);
        }

        function loadFragmentShader(success, ajax) {
            loadShader("fragment", ajax, success);
        }

        function createFragmentShader(fragmentShaderCode, gl) {
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER, "shader-fs");
            gl.shaderSource(fragmentShader, fragmentShaderCode);
            gl.compileShader(fragmentShader);
            return checkShaderCompilationStatus(fragmentShader, gl);
        }

        function createVertexShader(vertexShaderCode, gl) {
            var vertexShader = gl.createShader(gl.VERTEX_SHADER, "shader-vs");
            gl.shaderSource(vertexShader, vertexShaderCode);
            gl.compileShader(vertexShader);
            return checkShaderCompilationStatus(vertexShader, gl);
        }

        function createShaders(gl, ajax) {

            loadVertexShader(function (xhr) {
                createVertexShader(xhr, gl);
            }, ajax);

            loadFragmentShader(function (xhr) {
                createFragmentShader(xhr, gl);
            }, ajax);

        }

        return {
            initShaders: function (gl, ajax) {
                createShaders(gl, ajax);
            },

            clearCanvas: function(gl, r, g, b, a) {
                gl.clearColor(r || 0.0, g || 0.0, b || 0.0, a || 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
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
            error: _U.noop,
            async: true
        };

        function serializeAjaxSettings(success, error, settings) {
            settings.success = success;
            settings.error = error;
            return _U.extend(DEFAULT_SETTINGS, settings);
        }

        function sendAjaxRequest(settings) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open(settings.method, settings.url, settings.async);
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    // in some cases not good to pass in arguments only response
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

            webGl_utils.initShaders(gl, ajax);

            webGl_utils.clearCanvas(gl, 1.0);

        }

        return main;
    }());

}());

