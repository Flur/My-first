const Tone = window.Tone;

const synth = new Tone.Synth().toMaster();

const NOTES_DURATION = {
    1: '1n',
    2: '2n',
    4: '4n',
    8: '8n',
    16: '16n',
    32: '32n',
};

var conga = new Tone.MembraneSynth({
    "pitchDecay" : 0.008,
    "octaves" : 2,
    // "envelope" : {
    //     "attack" : 0.0006,
    //     "decay" : 0.5,
    //     "sustain" : 0
    // }
}).toMaster();

Tone.Transport.loopEnd = 0;
Tone.Transport.bpm.value = 80;
Tone.Transport.loop = true;

export function addToneBar(beats, noteDuration, barId) {
    const toneNoteDuration = NOTES_DURATION[noteDuration];
    const toneTimeNoteDuration = Tone.Time(toneNoteDuration);
    const loopEnd = Tone.Transport.loopEnd;
    Tone.Transport.loopEnd = loopEnd + toneTimeNoteDuration * beats;

    // first beat of the bar
    /**
     * todo change to Tone.Sequence
     */
    Tone.Transport.schedule((time) => {
        conga.triggerAttackRelease('C4', '16n', time);
    }, loopEnd);

    if (beats === 1) {
        return;
    }

    // dont use schedule repeat when it don't needed as it adds more events on transrport that overlaps other events
    if (beats === 2) {
        Tone.Transport.schedule((time) => {
            conga.triggerAttackRelease('G3', '16n', time);
        }, loopEnd + toneTimeNoteDuration);

        return;
    }

    Tone.Transport.scheduleRepeat((time) => {
        conga.triggerAttackRelease('G3', '16n', time);
    }, toneNoteDuration, loopEnd + toneTimeNoteDuration, toneTimeNoteDuration * (beats - 1) );
}

export function toggle() {
    Tone.Transport.toggle();
}

export function reset() {
    Tone.Transport.cancel();
    Tone.Transport.loopEnd = 0;
}
