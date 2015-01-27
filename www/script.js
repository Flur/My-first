document.addEventListener('DOMContentLoaded', init);
var playButton = document.getElementById("play"),
    bpm = document.getElementById('bpm'),
    range = document.getElementById('range'),
    error = document.getElementById('error');

playButton.onclick = function() {playButton.innerHTML = play();};
bpm.oninput = function() {
  if (bpm.value > 240 || bpm.value < 40) {
  	error.innerHTML = "Bpm має бути не більше 240 та не меньше 40";
  } else {
  	range.value = bpm.value;
  }
  
};
range.oninput = function() {bpm.value = range.value;};