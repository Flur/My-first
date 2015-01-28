// DOM

var playButton = document.getElementById("play"),
    bpm = document.getElementById('bpm'),
    range = document.getElementById('range'),
    minus = document.getElementById('minus'),
    plus = document.getElementById('plus'),
    playImg = "images/play.png",
    stopImg = "images/stop.png";

document.addEventListener('DOMContentLoaded', init);    

playButton.onclick = function() {playButton.src = play();};
range.oninput = function() {
	tempo = bpm.innerHTML = parseInt(range.value, 10); // from string to integer
};

minus.onclick = function() {
  range.value = bpm.innerHTML = (tempo === 40) ? tempo : tempo -= 1; 
};

plus.onclick = function() {
	range.value = bpm.innerHTML = (tempo === 240) ? tempo : tempo += 1;
}
