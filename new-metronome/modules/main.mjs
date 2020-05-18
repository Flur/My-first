import { addToneBar, toggle, reset } from './metronome.mjs'
import { addUIBar } from './ui.mjs'

const BARS = [];

function updateBars() {
    reset();

    BARS.forEach(({beats, noteDuration}, index) => {
        addToneBar(beats, noteDuration, index + 1);
    });
}

function onBeatsChange(barId, beats) {
    const bar = BARS[barId - 1];
    bar.beats = Number(beats);

    updateBars();
}

function onBeatDurationChange(barId, beatsDuration) {
    const bar = BARS[barId - 1];
    bar.noteDuration = Number(beatsDuration);

    updateBars();
}

function onRemoveBar(barId) {
    BARS.splice(barId - 1, 1);

    updateBars();
}

function addBar(beats, noteDuration) {
    const barId = BARS.push({beats, noteDuration});

    addToneBar(beats, noteDuration, barId);
    addUIBar(beats, noteDuration, barId, onBeatsChange, onBeatDurationChange, onRemoveBar);
}

addBar(4, 4);

document.querySelector('#button-toggle').addEventListener('click', () => toggle());
document.querySelector('#button-add').addEventListener('click', () => {
    addBar(4, 4);
});
document.querySelector('#bpm').addEventListener('change', (event) => {
    Tone.Transport.bpm.value = event.target.value;

    const bpmLabel = document.querySelector('#bpm-label');
    bpmLabel.textContent = `Bpm: ${event.target.value}`;
});
