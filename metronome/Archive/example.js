
if (!window.WebAudioMetronome) window.WebAudioMetronome = {}

WebAudioMetronome.BufferLoader = function (context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

WebAudioMetronome.BufferLoader.prototype.loadBuffer = function (url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function () {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(request.response,
            function (buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            },
            function (error) {
                alert('decodeAudioData error: ' + error);
            }
        );
    }

    request.onerror = function () {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

WebAudioMetronome.BufferLoader.prototype.load = function () {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}

WebAudioMetronome.SoundPool = function (factory, size) { // приходит this и размер пула (чаше всего размер 10)
    var sounds = []

    function initSound(sound) {
    	if (!('onended' in sound)) return //проверяем есть ли свойство opened в соурс буферре и если да то возвращаемся
        sound.onended = function () { //добавляет в буффер свойство  
            this.isFree = true
        }
    }
    
    function isFreeSound(sound) {
    	if ('onended' in sound)
    		return sound.isFree
    	if ('playbackState' in sound)
    		return sound.playbackState == sound.FINISHED_STATE
    	return false
    }

    this.init = function () {
        for (var i = 0; i < size; i++) { // столько запихиваем сколько надо (в зависимости от пула)
            var sound = factory.createSound() // метод метронома который возвращает буфер со звуками
            sounds.push(sound) //буфер тот что вернулся засовываем в пустой массив
            initSound(sound)  // и вызываем в котором буфер возвращенный с createSound
        }
    }

    this.forEach = function (action) {
        var size = sounds.length
        for (var i = 0; i < size; i++) {
            action(sounds[i], i)
        }
    }

    this.getSize = function () { return size }
    this.getSound = function (index) { return sounds[index] }

    this.replaceSound = function (index, newSound) {
        var oldSound = sounds[index]
        sounds[index] = newSound
        initSound(newSound)
    }

    this.forEachFree = function (action) {
        var size = sounds.length
        for (var i = 0; i < size; i++) {
            var sound = sounds[i]
            if (isFreeSound(sound))
                action(sound, i)
        }
    }

    this.forEachBusy = function (action) {
        var size = sounds.length
        for (var i = 0; i < size; i++) {
            var sound = sounds[i]
            if (!isFreeSound(sound))
                action(sound, i)
        }
    }

    this.init()
}

WebAudioMetronome.isSupported = function () {
    return window.AudioContext || window.webkitAudioContext
}

WebAudioMetronome.Metronome = function (resourcesPath) {

    this.pool = null
    this.timer = null
    this.period = 0
    this.isStarted = false
    this.gainNode = null
    this.context = null
    this.buffer = null

    this.init = function init() {
		if (!WebAudioMetronome.isSupported())
			throw new Error("Web Audio API is not supported.")
        var AudioContext = window.AudioContext || window.webkitAudioContext
        this.context = new AudioContext()
        this.buffer = null

        var self = this
		var soundFileName = 'click.wav'
		var soundUrl = soundFileName
		if (resourcesPath) soundUrl = resourcesPath + '/' + soundFileName
        bufferLoader = new WebAudioMetronome.BufferLoader(this.context, [soundUrl],
			function (bufferList) { self.buffer = bufferList[0] })
        bufferLoader.load()
    }

    this.getGainNode = function () {
        if (this.gainNode == null) {
	        // Safari compatibility fix
        	if (!this.context.createGain && this.context.createGainNode)
        		this.context.createGain = this.context.createGainNode
            this.gainNode = this.context.createGain()
        }
        return this.gainNode
    }

    this.createSound = function () {
        var source = this.context.createBufferSource() // создаем буфер
        source.buffer = this.buffer // в этот буфер были загруженны звуки
        source.repeatIndex = 0
        var gainNode = this.getGainNode() // вот тут повнимательнее, создаём ручку громкости
        source.connect(gainNode) // и соедниняем громкость
        gainNode.connect(this.context.destination)
        // Safari compatibility fix
        if (!source.start && source.noteOn)
        	source.start = source.noteOn
        if (!source.stop && source.noteOff)
        	source.stop = source.noteOff
        return source // и возвращаем этот буфер
    }

    this.start = function (bpm) {
        var self = this

        if ((bpm < 0.009) || (bpm > 10000))
            throw new Error("BPM is out of supported range")

        if (this.buffer == null) {
            window.setTimeout(function () { self.start(bpm) }, 1000)
            return
        }

        if (this.isStarted) {
            this.stop()
        }

        this.isStarted = true

        this.bpm = bpm
        var delay = 60.0 / this.bpm

        var poolSize = Math.max(10, Math.round(3.0 / delay)) // округляем и выбираем 10 или большее число
        this.pool = new WebAudioMetronome.SoundPool(this, poolSize) // создаем новый екземпляр класса
        var currentTime = this.context.currentTime // записываем текушее время
        var startTime = currentTime //старт ссылаеться на текущее время 
        for (var i = 0; i < poolSize; i++) {
            var sound = this.pool.getSound(i) // возвращает звук из массива созданого в объекте "басейн)"
            sound.startTime = startTime // создаём свойство 
            sound.start(sound.startTime) // запускаем
            startTime += delay // с каждым кругом добавляем паузу
        }
        this.period = startTime - currentTime

        this.timer = window.setInterval(function () { self.onTimer() }, 1000)
    }

    this.onTimer = function () {
        if (!this.isStarted) return
        var self = this
        this.pool.forEachFree(function (oldSound, index) { //
            var sound = self.createSound()
            self.pool.replaceSound(index, sound)
            sound.startTime = oldSound.startTime + self.period
            //console.log('starting sound at ' + sound.startTime)
            sound.start(sound.startTime)
        })
    }

    this.stop = function () {
        if (this.timer != null) {
            window.clearInterval(this.timer)
            this.timer = null
        }

        if (this.pool != null) {
            var self = this
            this.pool.forEachBusy(function (sound, index) {
                sound.stop(0)
            })
            this.pool = null
        }

        if (this.gainNode != null) {
            this.gainNode.gain.value = 0
            this.gainNode = null
        }

        this.isStarted = false

    }

    this.init()

}
