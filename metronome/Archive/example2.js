function SplitNumberIntoRandomParts(number) {
	var sum = [];
	while (number > 0) {
		var part = Math.round(Math.random() * (number - 1)) + 1;
		sum.push(part);
		number -= part;
	}
	return sum;
}

function GetRandomNumberBetween(min, max) { return (Math.floor(Math.random() * max) + min); }

function GetRandomBoolean() { return Math.random() < .5; }

function BufferLoader(context, urlList, callback) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = new Array();
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";
	var loader = this;
	request.onload = function() {
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

$(function() {
	var BUFFERS = {};
	var context = null;
	var BUFFERS_TO_LOAD = {
		kick: 'http://rockmusiciansmap.com/sounds/kick.ogg',
		snare: 'http://rockmusiciansmap.com/sounds/snare.ogg',
		hihat: 'http://rockmusiciansmap.com/sounds/chinahat.ogg',
		zeroOpened: 'http://rockmusiciansmap.com/sounds/esk2.ogg',
		zeroMuted: 'http://rockmusiciansmap.com/sounds/eskmn.ogg'
	};
	
	function loadBuffers() {
		var names = [];
		var paths = [];
		for (var name in BUFFERS_TO_LOAD) {
			var path = BUFFERS_TO_LOAD[name];
			names.push(name);
			paths.push(path);
		}
		bufferLoader = new BufferLoader(context, paths, function(bufferList) {
			for (var i = 0; i < bufferList.length; i++) {
				var buffer = bufferList[i];
				var name = names[i];
				BUFFERS[name] = buffer;
			}
		});
		bufferLoader.load();
	}
	
	var RhythmSample = { };
	//Темп выбирается случайно
	var tempo = GetRandomNumberBetween(90, 125);
	RhythmSample.play = function() {
		function playSound(buffer, time) {
			var source = context.createBufferSource();
			source.buffer = buffer;
			source.connect(context.destination);
			if (!source.start)
				source.start = source.noteOn;
			source.start(time);
		}
		var kick = BUFFERS.kick;
		var snare = BUFFERS.snare;
		var hihat = BUFFERS.hihat;
		var startTime = context.currentTime + 0.100;
		var eighthNoteTime = (60 / tempo) / 2;
		
		//Ударить [quantity] раз карданом во время [time]
		//За [eightNotesTaken / 8] часть такта
		function playKick(time, quantity, eightNotesTaken) {
			for(var i = 1; i <= quantity; ++i) 
				playSound(kick, time + i * eighthNoteTime / (quantity / 8) / (8 / eightNotesTaken));
		}
	  
		function playRandomKickTact(time) { //Кардан
			//1. Разделим такт на случайные части
			var parts = SplitNumberIntoRandomParts(8);
			//2. Присвоим переменную времени
			var currentTime = time;  
			for(var i = 0; i < parts.length; ++i) {
				//3. На каждую часть выделим случайное количество ударов
				playKick(currentTime, parts[i] * GetRandomNumberBetween(0, 3), parts[i]);
				//4. Прибавим к переменной времени продолжительность части
				currentTime += parts[i] * eighthNoteTime;
			}
		}
		
		for (var bar = 0; bar < 60; bar++) { //Каждая итерация равна секунде времени
			var time = startTime + bar * 8 * eighthNoteTime; //Текущее время генерируемого трека
			for (var i = 1; i <= 8; ++i) { //Малый барабан
				//Воспроизведен случайно в нескольких тактах
				if(GetRandomBoolean()) 
					playSound(snare, time + i * eighthNoteTime);
			}
			for (var i = 1; i <= 8; ++i) { //Нули на гитаре
				//Воспроизводятся в случайных 1\8 частях
				if(GetRandomBoolean()) {
					//Случайно открытый или закрытый звук
					if(GetRandomBoolean())
						playSound(BUFFERS.zeroOpened, time + i * eighthNoteTime);
					else
						playSound(BUFFERS.zeroMuted, time + i * eighthNoteTime);
				}
			}
			//Тарелки всегда стучат в 1\8 и 5\8 частях
			playSound(hihat, time + 1 * eighthNoteTime);	
			playSound(hihat, time + 5 * eighthNoteTime);
			//В других частях тарелки стучат в случайном порядке
			if(GetRandomBoolean()) {
				if(GetRandomBoolean()) {
					playSound(hihat, time + 2 * eighthNoteTime);
					playSound(hihat, time + 6 * eighthNoteTime);
				} else {
					playSound(hihat, time + 3 * eighthNoteTime);
					playSound(hihat, time + 7 * eighthNoteTime);
				}
			}
			playRandomKickTact(time + eighthNoteTime);
		}
	};
	
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();
	}
	catch(e) {
		alert("Web Audio API is not supported in this browser");
	}
	loadBuffers();
	
	var clickHandler = function(){
		RhythmSample.play();
		$('#buttonPlay').unbind( "click" );
		setTimeout(function(){ $('#buttonPlay').click(clickHandler) }, 61000);
	}
	
	$('#buttonPlay').click(clickHandler);
});
