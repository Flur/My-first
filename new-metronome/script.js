
var p;

(function () {
    p = function play() {
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);

        console.log(context.currentTime);
    }

    var context = new (window.AudioContext || window.webkitAudioContext)();

    // play(context);


    var oscillator = context.createOscillator();

    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    oscillator.connect(context.destination);
    var now = context.currentTime;

    // var gainNode = context.createGain();
    // oscillator.connect(gainNode);
    // gainNode.connect(context.destination);
    //
    // gainNode.gain.setValueAtTime(0.5, context.currentTime);



    // oscillator.stop(now + 0.5);

    console.log(context);
})();
