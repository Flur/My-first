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
            return checkShaderCompilationStatus(fragmentShader, gl) ? fragmentShader : false;
        }

        function createVertexShader(vertexShaderCode, gl) {
            var vertexShader = gl.createShader(gl.VERTEX_SHADER, "shader-vs");
            gl.shaderSource(vertexShader, vertexShaderCode);
            gl.compileShader(vertexShader);
            return checkShaderCompilationStatus(vertexShader, gl) ? vertexShader : false;
        }

        function loadAndCompileVertexShader(gl, ajax) {
            var vertexShader;

            loadVertexShader(function (xhr) {
                vertexShader = createVertexShader(xhr, gl);
            }, ajax);

            return vertexShader;
        }

        function loadAndCompileFragmentShader(gl, ajax) {
            var fragmentShader;

            loadFragmentShader(function (xhr) {
                fragmentShader = createFragmentShader(xhr, gl);
            }, ajax);

            return fragmentShader;
        }

        function createProgramAndAttachShaders(gl, vertexShader, fragmentShader) {
            var shaderProgram = gl.createProgram();

            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);

            // link to the context
            gl.linkProgram(shaderProgram);

            // and using this program
            gl.useProgram(shaderProgram);

            return shaderProgram;
        }

        return {
            initWebGl: function (gl, ajax) {
                var fragmentShader = loadAndCompileFragmentShader(gl, ajax);
                var vertexShader = loadAndCompileVertexShader(gl, ajax);
                return createProgramAndAttachShaders(gl, vertexShader, fragmentShader);
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
     *   Module for canvas events
     * */
    var canvasEvents = (function(){

        var xy = [];
        var rgba = [];
        var sizes = [];
        const colors = {
            red: [1.0 , 0.0, 0.0, 1.0],
            green: [0.0, 1.0, 0.0, 1.0],
            blue: [0.0, 0.0, 1.0, 1.0],
            white: [1.0, 1.0, 1.0, 1.0]
        };

        // no need in canvas, can take reference from event
        function onMouseDownCanvasEventHandler(ev, gl, canvas, a_Position, u_FragColor, a_PointSize) {
            var pointsLength;
            var x = ev.clientX;
            var y = ev.clientY;
            var rect = canvas.getBoundingClientRect(); // ev.target
            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

            xy.push([x,y]);
            sizes.push(Math.random() * 10);
            rgba.push(colorSelector(x, y));
            pointsLength = xy.length;

            // can use webgl_utils
            gl.clear(gl.COLOR_BUFFER_BIT);

            for (var i = 0 ; i < pointsLength ; i+=1) {
                gl.vertexAttrib2f(a_Position, xy[i][0], xy[i][1]);
                gl.vertexAttrib1f(a_PointSize, sizes[i]);
                gl.uniform4f(u_FragColor, rgba[i][0], rgba[i][1], rgba[i][2], rgba[i][3]);
                gl.drawArrays(gl.POINTS, 0, 1);
            }

        }

        function colorSelector(x, y) {
            if (x < 0) {
                return y > 0 ? colors.red : colors.blue;
            } else {
                return y > 0 ? colors.green : colors.white;
            }
        }

        return {
            init: function(gl, canvas, a_Position, u_FragColor, a_PointSize) {
                canvas.onmousedown = function(ev) {onMouseDownCanvasEventHandler(ev, gl, canvas, a_Position,
                    u_FragColor, a_PointSize)}
            }
        };
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

            var a_Position,
                a_PointSize,
                u_FragColor,
                program;

            var gl = getWebGlContextByCanvas("canvas");

            // returns program obj
            program = webGl_utils.initWebGl(gl, ajax);

            a_Position = gl.getAttribLocation(program, "a_Position");

            u_FragColor = gl.getUniformLocation(program, "u_FragColor");

            a_PointSize = gl.getAttribLocation(program, "a_PointSize");

            webGl_utils.clearCanvas(gl);

            canvasEvents.init(gl, canvas, a_Position, u_FragColor, a_PointSize);

        }

        return main;
    }());

}());

