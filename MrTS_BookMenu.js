//=============================================================================
// MrTS_BookMenu.js
//=============================================================================

/*:
* @plugindesc Changes menu looks.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.1
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* How to set it up
* --------------------------------------------------------------------------------
* Open up MrTS_BookMenu.js plugin in your favorite text editor and scroll down
* to the part where it says "SET COMMANDS HERE" - follow instructions from there.
*
* All images go into img\system folder:
* - img\system\menuBook.png
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Fixed a bug with accessing wrong commands.
*     - Fixed a crash with unidentified coordinates.
* 1.0 - Release
*/

(function() {
	/* --------------------------------------------------------------------------------
	 * -------- SET COMMANDS HERE v
	 * -------------------------------------------------------------------------------- */
	var pictureList = {
		// HANDLER: ["ImageName", X Position, Y Position],
		'item': ["inventory", 250, 120],
		'status': ["status", 370, 430],
		'options': ["options", 780, 130],
		'save': ["save", 950, 260],
		'gameEnd': ["exit", 820, 520] 
	};
	/* --------------------------------------------------------------------------------
	 * -------- SET COMMANDS UP THERE ^
	 * -------------------------------------------------------------------------------- */

	var _SceneMenuBase_createBackground = Scene_MenuBase.prototype.createBackground;
	Scene_Menu.prototype.createBackground = function() {
		_SceneMenuBase_createBackground.call(this);
		this._bookSprite = new Sprite();
		this._bookBitmap = ImageManager.loadSystem("menuBook");
		this._bookSprite.bitmap = this._bookBitmap;
		this.addChild(this._bookSprite);
	};

	var _SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_SceneMenu_createCommandWindow.call(this);
		this._commandWindow.x = -this._commandWindow.standardPadding();
		this._commandWindow.y = -this._commandWindow.standardPadding();
		this._commandWindow.opacity = 0;
	};

	var _SceneMenu_createGoldWindow = Scene_Menu.prototype.createGoldWindow;
	Scene_Menu.prototype.createGoldWindow = function() {
		_SceneMenu_createGoldWindow.call(this);
		this._goldWindow.visible = false;
	};

	var _SceneMenu_createStatusWindow = Scene_Menu.prototype.createStatusWindow;
	Scene_Menu.prototype.createStatusWindow = function() {
		_SceneMenu_createStatusWindow.call(this);
		this._statusWindow.x = Graphics.boxWidth - this._statusWindow.width;
		this._statusWindow.visible = false;
	};

	var _SceneMenu_commandPersonal = Scene_Menu.prototype.commandPersonal;
	Scene_Menu.prototype.commandPersonal = function() {
		_SceneMenu_commandPersonal.call(this);
		this._statusWindow.visible = true;
	};

	var _SceneMenu_commandFormation = Scene_Menu.prototype.commandFormation;
	Scene_Menu.prototype.commandFormation = function() {
		_SceneMenu_commandFormation.call(this);
		this._statusWindow.visible = true;
	};

	var _SceneMenu_onPersonalCancel = Scene_Menu.prototype.onPersonalCancel;
	Scene_Menu.prototype.onPersonalCancel = function() {
		_SceneMenu_onPersonalCancel.call(this);
		this._statusWindow.visible = false;
	};

	var _SceneMenu_onFormationCancel = Scene_Menu.prototype.onFormationCancel;
	Scene_Menu.prototype.onFormationCancel = function() {
		_SceneMenu_onFormationCancel.call(this);
		this._statusWindow.visible = false;
	};

	var _WindowMenuCommand_initialize = Window_MenuCommand.prototype.initialize;
	Window_MenuCommand.prototype.initialize = function(x, y) {
		this._commandSprites = [];
		this._maxTone = 50;
		this._minTone = 0;
	    _WindowMenuCommand_initialize.call(this, x, y);
		for (var i = 0; i < this._list.length; i++) {
			var symbol = this.commandSymbol(i);
			if (!pictureList[symbol]) continue;
			var tmpSpr = new Sprite();
			var tmpBmp = ImageManager.loadSystem(pictureList[symbol][0]);
			tmpSpr.x = pictureList[symbol][1];
			tmpSpr.y = pictureList[symbol][2];
			tmpSpr.bitmap = tmpBmp;
			this.addChild(tmpSpr);
			this._commandSprites.push(tmpSpr);
		}
	};

	var _WindowMenuCommand_update = Window_MenuCommand.prototype.update;
	Window_MenuCommand.prototype.update = function() {
	    _WindowMenuCommand_update.call(this);
	    for (var i = 0; i < this._commandSprites.length; i++) {
	    	if (this.index() === i && this._commandSprites[i].getColorTone()[0] < this._maxTone)
	    	{
	    		var tone = this._commandSprites[i].getColorTone()[0] + 5;
	    		this._commandSprites[i].setColorTone([tone, tone, tone, 0]);
	    		if (this._commandSprites[i].getColorTone()[0] > this._maxTone)
	    			this._commandSprites[i].setColorTone([this._maxTone, this._maxTone, this._maxTone, 0]);
	    	}
	    	else if (this.index() !== i && this._commandSprites[i].getColorTone()[0] > this._minTone)
	    	{
	    		var tone = this._commandSprites[i].getColorTone()[0] - 5;
	    		this._commandSprites[i].setColorTone([tone, tone, tone, 0]);
	    		if (this._commandSprites[i].getColorTone()[0] < this._maxTone)
	    			this._commandSprites[i].setColorTone([this._minTone, this._minTone, this._minTone, 0]);
	    	}
	    }
	};

	Window_MenuCommand.prototype.windowWidth = function() {
	    return Graphics.boxWidth + this.standardPadding() * 2;
	};

	Window_MenuCommand.prototype.windowHeight = function() {
	    return Graphics.boxHeight + this.standardPadding() * 2;
	};

	Window_MenuCommand.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
	};

	Window_MenuCommand.prototype.drawItem = function(index) {
	};

	Window_MenuCommand.prototype.itemRect = function(index) {
		return {
			x: this._commandSprites[index].x - this.standardPadding(),
			y: this._commandSprites[index].y - this.standardPadding(),
			width: this._commandSprites[index].width,
			height: this._commandSprites[index].height

		};
	};

	Window_MenuCommand.prototype.distance = function(x1, y1, x2, y2) {
		var a = x1 - x2;
		var b = y1 - y2;
		return Math.abs(a) + Math.abs(b);
	};

	Window_MenuCommand.prototype.cursorDown = function(wrap) {
		var lowerWithY = [];
		var index = this.index();
		for (var i = 0; i < this._commandSprites.length; i++) {
			if (this._commandSprites[i].y > this._commandSprites[index].y)
				lowerWithY.push(i);
		}
		var cs = this._commandSprites;
		var df = this.distance;
		lowerWithY.sort(function(a, b) {
			return df(cs[index].x, cs[index].y, cs[a].x, cs[a].y) - df(cs[index].x, cs[index].y, cs[b].x, cs[b].y)
		});
		if (lowerWithY.length > 0) this.select(lowerWithY[0]);
	};

	Window_MenuCommand.prototype.cursorUp = function(wrap) {
		var higherWithY = [];
		var index = this.index();
		for (var i = 0; i < this._commandSprites.length; i++) {
			if (this._commandSprites[i].y < this._commandSprites[index].y)
				higherWithY.push(i);
		}
		var cs = this._commandSprites;
		var df = this.distance;
		higherWithY.sort(function(a, b) {
			return df(cs[index].x, cs[index].y, cs[a].x, cs[a].y) - df(cs[index].x, cs[index].y, cs[b].x, cs[b].y)
		});
		if (higherWithY.length > 0) this.select(higherWithY[0]);
	};

	Window_MenuCommand.prototype.cursorRight = function(wrap) {
	    var higherWithX = [];
		var index = this.index();
		for (var i = 0; i < this._commandSprites.length; i++) {
			if (this._commandSprites[i].x > this._commandSprites[index].x)
				higherWithX.push(i);
		}
		var cs = this._commandSprites;
		var df = this.distance;
		higherWithX.sort(function(a, b) {
			return df(cs[index].x, cs[index].y, cs[a].x, cs[a].y) - df(cs[index].x, cs[index].y, cs[b].x, cs[b].y)
		});
		if (higherWithX.length > 0) this.select(higherWithX[0]);
	};

	Window_MenuCommand.prototype.cursorLeft = function(wrap) {
	    var lowerWithX = [];
		var index = this.index();
		for (var i = 0; i < this._commandSprites.length; i++) {
			if (this._commandSprites[i].x < this._commandSprites[index].x)
				lowerWithX.push(i);
		}
		var cs = this._commandSprites;
		var df = this.distance;
		lowerWithX.sort(function(a, b) {
			return df(cs[index].x, cs[index].y, cs[a].x, cs[a].y) - df(cs[index].x, cs[index].y, cs[b].x, cs[b].y)
		});
		if (lowerWithX.length > 0) this.select(lowerWithX[0]);
	};

	Window_MenuCommand.prototype.needsCommand = function(name) {
	    if (pictureList[name]) return true;
	    return false;
	};
})();
