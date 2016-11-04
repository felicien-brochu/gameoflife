﻿function Settings(gameOfLife) {
	this.gameOfLife = gameOfLife;
	this.panel = document.getElementById("gog-settings-panel");
	this.autoHider = new AutoHider(
		document.getElementById("gog-game-of-life-canvas"),
		[this.panel, document.getElementById("gog-action-buttons"), document.getElementById("gog-bottom-action-buttons")],
		2200, 150);
	this.panelDisplayed = true;

	window.addEventListener("keydown", this.onKeyDown.bind(this));

	if (window.innerWidth < 600) {
		this.togglePanel();
	}

	this.initActionButtons();
	this.initSliders();
	this.initSymmetryRadio();
	this.initPatternButtons();
};

Settings.prototype.initActionButtons = function() {
	this.tutorialButton = document.getElementById("gog-tutorial-button");
	this.fullscreenButton = document.getElementById("gog-fullscreen-button");
	this.settingsButton = document.getElementById("gog-settings-button");
	this.resetButton = document.getElementById("gog-reset-button");
	this.playPauseButton = document.getElementById("gog-play-pause-button");
	this.undoButton = document.getElementById("gog-undo-button");
	this.redoButton = document.getElementById("gog-redo-button");

	this.tutorialButton.addEventListener('click', startTutorial);
	this.fullscreenButton.addEventListener('click', this.onFullscreenButtonMouseDown.bind(this));
	document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
	this.settingsButton.addEventListener('click', this.onSettingsButtonMouseDown.bind(this));
	this.resetButton.addEventListener('click', this.onResetClick.bind(this));
	this.playPauseButton.addEventListener('click', this.onPlayPauseClick.bind(this));
	this.undoButton.addEventListener('click', this.onUndoClick.bind(this));
	this.redoButton.addEventListener('click', this.onRedoClick.bind(this));

	var buttons = document.getElementById('gog-action-buttons').getElementsByTagName('button');
	for (var i = 0; i < buttons.length; ++i) {
		buttons[i].addEventListener("keyup", this.preventDefaultKeyUp.bind(this));
	}
}

Settings.prototype.initSliders = function() {
	this.speedSlider = document.getElementById("gog-speed-slider");
	this.traceSlider = document.getElementById("gog-trace-slider");
	this.colorSlider = document.getElementById("gog-color-slider");

	var intervalX = 2000 / (this.gameOfLife.interval + 16) - 3;
	this.speedSlider.slider.setValue(intervalX / 80 * 100);
	this.traceSlider.slider.setValue(this.gameOfLife.colorAgeSize / 255 * 100);
	this.colorSlider.slider.setValue(this.gameOfLife.hueOffset);

	this.speedSlider.addEventListener('slideend', function(event) {
		this.gameOfLife.setInterval(2000 / (event.detail / 100 * 80 + 3) - 16);
	}.bind(this));

	this.traceSlider.addEventListener('valuechanged', function(event) {
		this.gameOfLife.setColorAgeSize(Math.floor(event.detail / 100 * 254 + 2));
	}.bind(this));

	this.colorSlider.addEventListener('valuechanged', function(event) {
		this.gameOfLife.setHueOffset(event.detail);
	}.bind(this));
}

Settings.prototype.initSymmetryRadio = function() {
	var symmetryList = document.getElementById("gog-symmetry-container");
	var symmetriesRadios = symmetryList.getElementsByTagName("input");

	for (var i = 0; i < symmetriesRadios.length; ++i) {
		var radio = symmetriesRadios[i];
		if (radio.value == this.gameOfLife.drawSymmetry) {
			radio.checked = true;
		}
		radio.addEventListener('change', this.onSymmetrySelect.bind(this));
	}
}

Settings.prototype.initPatternButtons = function() {
	this.crossPatternButton = document.getElementById("gog-cross-pattern-button");
	this.gunPatternButton = document.getElementById("gog-gun-pattern-button");
	this.randomPatternButton = document.getElementById("gog-random-pattern-button");
	this.canvasPatternButton = document.getElementById("gog-canvas-pattern-button");

	this.crossPatternButton.addEventListener('click', function() {
		this.gameOfLife.generatePattern(generateCrossPattern);
	}.bind(this));
	this.gunPatternButton.addEventListener('click', function() {
		this.gameOfLife.generatePattern(generateGunPattern);
	}.bind(this));
	this.randomPatternButton.addEventListener('click', function() {
		this.gameOfLife.generatePattern(generateRandomPattern);
	}.bind(this));
	this.canvasPatternButton.addEventListener('click', function() {
		this.gameOfLife.generatePattern(generateRocketLaunchersCanvas);
	}.bind(this));

	var buttons = document.getElementsByTagName('button');
	for (var i = 0; i < buttons.length; ++i) {
		buttons[i].addEventListener("keyup", this.preventDefaultKeyUp.bind(this));
	}
}

Settings.prototype.onSymmetrySelect = function(event) {
	this.gameOfLife.drawSymmetry = event.target.value;
}

Settings.prototype.onKeyDown = function(event) {
	if (event.keyCode == 32 && this.gameOfLife) {      //< Space bar
		this.gameOfLife.toggleGame();
		event.preventDefault();
	} else if (event.keyCode == 90 && event.ctrlKey) { //< Ctrl+Z
		this.onUndoClick();
		event.preventDefault();
	} else if (event.keyCode == 89 && event.ctrlKey) { //< Ctrl+Y
		this.onRedoClick();
		event.preventDefault();
	}
}

Settings.prototype.preventDefaultKeyUp = function(event) {
	if (event.keyCode == 32) {                         //< Space bar
		event.preventDefault();
	} else if (event.keyCode == 90 && event.ctrlKey) { //< Ctrl+Z
		event.preventDefault();
	} else if (event.keyCode == 89 && event.ctrlKey) { //< Ctrl+Y
		event.preventDefault();
	}
}

Settings.prototype.onGamePause = function() {
	this.playPauseButton.childNodes[0].childNodes[0].setAttribute("xlink:href", "svg/sprite.svg#shape-ic-play-arrow");
	this.autoHider.setEnabled(false);
}

Settings.prototype.onGameStart = function() {
	this.playPauseButton.childNodes[0].childNodes[0].setAttribute("xlink:href", "svg/sprite.svg#shape-ic-pause");
	this.autoHider.setEnabled(true);
}

Settings.prototype.onPlayPauseClick = function() {
	if (this.gameOfLife) {
		this.gameOfLife.toggleGame();
	}
}

Settings.prototype.onResetClick = function() {
	if (this.gameOfLife && !this.gameOfLife.isReset()) {
		this.gameOfLife.resetGame();
	}
}

Settings.prototype.onSettingsButtonMouseDown = function() {
	this.togglePanel();
}

Settings.prototype.onFullscreenButtonMouseDown = function() {
	toggleFullscreen();
}

Settings.prototype.onFullscreenChange = function() {
	if (getFullscreenElement()) {
		this.fullscreenButton.childNodes[0].childNodes[0].setAttribute("xlink:href", "svg/sprite.svg#shape-ic-fullscreen-exit");
	} else {
		this.fullscreenButton.childNodes[0].childNodes[0].setAttribute("xlink:href", "svg/sprite.svg#shape-ic-fullscreen");	
	}
}

Settings.prototype.onUndoClick = function() {
	if (this.gameOfLife.hasToUndo()) {
		this.gameOfLife.undo();
	}
}

Settings.prototype.onRedoClick = function() {
	if (this.gameOfLife.hasToRedo()) {
		this.gameOfLife.redo();
	}
}

Settings.prototype.onHistoryChange = function() {
	setButtonEnabled(this.undoButton, this.gameOfLife.hasToUndo());
	setButtonEnabled(this.redoButton, this.gameOfLife.hasToRedo());
	setButtonEnabled(this.resetButton, !this.gameOfLife.isReset());
	setButtonEnabled(this.playPauseButton, !this.gameOfLife.isReset());
}

function setButtonEnabled(button, enabled) {
	var disabledClass = "gog-disabled";
	if (enabled && button.className.includes(disabledClass)) {
		button.className = button.className.replace(new RegExp('(?:^|\\s)'+ disabledClass + '(?:\\s|$)'), ' ');
	} else if (!enabled && !button.className.includes(disabledClass)) {
		button.className += " " + disabledClass;
	}
}

Settings.prototype.togglePanel = function() {
	if (this.panelDisplayed) {
		this.panelDisplayed = false;
		this.panel.style.visibility = "hidden";
	} else {
		this.panelDisplayed = true;
		this.panel.style.visibility = "visible";
	}
}