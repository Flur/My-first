"use strict";

var WebMetronome = {};

WebMetronome.Metronome = function() {
  
  // var init
  this.bbuu = new Array();
  this.bufferSource = null;
  this.bpm = null; 
  this.quarterNoteTime = null;
  this.startTime = null;
  this.audio = new (window.AudioContext || window.webkitAudioContext)();

  this.init = function() { 
    this.loadBuffer();
    this.bufferSource.connect(this.audio.destination);
  }

  this.start = function(bpm) {
    this.bpm = bpm;
    this.quarterNoteTime = 60.0 / bpm;
    this.startTime = this.audio.currentTime + 0.100;

    for (var bar = 0; bar < 60; bar++) {
      var time = this.startTime + bar * 4 * this.quarterNoteTime;

      for (var i = 0; i <= 4; ++i) {
        this.playSound(time + i +this.quarterNoteTime);
      }

    }

  }

  this.playSound = function (time) {
    var source = this.audio.createBufferSource();
    source.buffer = this.bbuu;
    console.log("play");
    source.connect(this.audio.destination);
    source.start(time);
  }

  this.init();


} 

// load and decode sound in buffer from source 
WebMetronome.Metronome.prototype.loadBuffer = function() {

  var request = new XMLHttpRequest();
  request.open('GET', 'click.mp3', true);
  request.responseType = 'arraybuffer';

  this.bufferSource = this.audio.createBufferSource();
  var that = this;

  request.onload = function() {

    var audioData = request.response;

    that.audio.decodeAudioData(audioData, function(buffer) {
        that.bbuu[0] = buffer;
      },

      function(e){"Error with decoding audio data" + e.err});

  }

  request.send();
}

var Metronome = new WebMetronome.Metronome();
Metronome.start(60);
