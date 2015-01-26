(function() { 
var buffer = null;
var context = null;
var tempo = document.getElementById('time');
var source = null;

document.addEventListener('DOMContentLoaded', function() {
  try {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();  
  }
  catch(e) {
    alert("Web Audio API is not supported in this browser");
  }

  loadClick = new BufferLoader(context, ['click.mp3'], 
    function(bufferList){buffer = bufferList[0];});
  loadClick.load();

});


function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

function playSound(thisBuffer, time) {
  source = context.createBufferSource();
  source.buffer = thisBuffer;
  source.connect(context.destination);
  console.log(time);
  if (!source.start)
    source.start = source.noteOn;
  source.start(time);
}

function start() {
  var bpm = tempo.value ? tempo.value : 60;
  var startTime = context.currentTime + 0.100;
  var quarterNoteTime = (60 / bpm);
  var time = null;
  
  function run() {
    for (var bar = 0; bar < 60; bar++) {
      time = startTime + bar * quarterNoteTime;
      //console.trace();

      playSound(buffer, time);  
    }
    startTime += time;
  }
  
  //setInterval(run(),61000);

}

function stop() {
  source.stop();
  console.log('ya')
}

var startButton = document.getElementById("start");
startButton.onclick = start;
})();

var stopButton = document.getElementById("stop");
stopButton.onclick = stop();
