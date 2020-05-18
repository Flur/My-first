// todo make one onChange callback
/**
 * move to svelte or check preact!
 */
export function addUIBar(beats, beatDuration, barId, onBeatChange, onBeatsDurationChange, onRemoveButton) {
    const ul = document.querySelector('#bars-list');
    const li = document.createElement('li');
    li.setAttribute('id', `bar-${barId}`);

    const onChangeBeatHandled = createOnChangeFunction(barId, onBeatChange);
    const onChangeDurationHandler = createOnChangeFunction(barId, onBeatsDurationChange);

    const input = appendNumberInputWithLabel(li, beats, onChangeBeatHandled);
    const select = getSelectNoteDuration(li, beatDuration, onChangeDurationHandler);

    li.append(
        ` ${beats} / ${beatDuration}`,
        getRemoveButton(onRemoveButton, barId,
            () => input.removeEventListener('change', onChangeBeatHandled),
            () => select.removeEventListener('change', onChangeDurationHandler)
        )
    );
    ul.append(li);
}

function createOnChangeFunction(barId, onChange) {
    return function (event) {
        onChange(barId, event.target.value);
    }
}

function getRemoveButton(onRemoveButton, barId, removeListenerInput, removeListenerSelect) {
    const removeButton = document.createElement('button');
    removeButton.append('Remove Bar');
    removeButton.addEventListener('click', () => {
        const ul = document.querySelector('#bars-list');
        const li = ul.querySelector(`#bar-${barId}`);

        removeListenerInput();
        removeListenerSelect();

        ul.removeChild(li);
        onRemoveButton(barId);
    });
    return removeButton;
}

function appendNumberInputWithLabel(parentNode, value, onChange) {
    const input = document.createElement('input');
    input.setAttribute('step', `1`);
    input.setAttribute('min', `1`);
    input.setAttribute('id', `input-beats`);
    input.setAttribute('type', 'number');
    input.value = value;

    input.addEventListener('change', onChange);

    const label = document.createElement('label');
    label.setAttribute('for', `input-beats`);
    label.append('Beats ');

    parentNode.append(label, input);

    return input;
}

function getSelectNoteDuration(li, value, onChange) {
    const select = document.createElement('select');
    select.setAttribute('id', `select-note-bar`);

    const label = document.createElement('label');
    label.setAttribute('for', `select-note-bar`);
    label.append('Duration ');

    [1, 2, 4, 8, 16, 32].map((value) => {
        const option = document.createElement('option');
        option.setAttribute('value', value);
        option.append(value);

        select.append(option)
    });

    select.value = String(value);
    select.addEventListener('change', onChange);
    li.append(label, select);

    return select;
}
