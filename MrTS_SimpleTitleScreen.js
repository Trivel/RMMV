//=============================================================================
// MrTS_SimpleTitleScreen.js
//=============================================================================

/*:
* @plugindesc Changes title screen commands to images and adds a cursor.
* @author Mr. Trivel
*
* @param Display Cursor
* @desc Display cursor next to the selected command?
* Default: True
* @default True
*
* @param Display Alternative
* @desc Display alternative image when command is selected?
* Default: True
* @default True
*
* @param Display Behind
* @desc Display image behind selected command?
* Default: True
* @default True
*
* @param Display Press Start
* @desc Display and ask for Press Start?
* Default: True
* @default True
*
* @param Commands Position
* @desc X Y position on the title screen.
* Default: 561 400
* @default 561 400
*
* @param Press Start Position
* @desc X Y position on the title screen.
* Default: 561 580
* @default 561 580
*
* @param Cursor Offset
* @desc X Y offset of cursor
* Default -60 0
* @default -60 0
*
* @param Behind Offset
* @desc Behind image offset
* Default -100 0
* @default -100 0
*  
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and for non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.1
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Image List
* --------------------------------------------------------------------------------
* Title screen image is selected in database per usual.
* 
* Other images go into img\system:
* img\system\titleCursor.png - can be omitted if cursor is set to false
* img\system\titleBehindCommand.png - can be omitted if behind is set to false
* img\system\titlePressStart.png - can be omitted if press s tart is set to false
*
* Remaining images have dynamic names which are constructor from word 'command_'
* and handler name. Example: command_newGame, command_continue, command_options.
* Those three are in default RPG Maker MV. If you have other plugins, you might
* need to add more images.
*
* Alternative command images when selected are named in similar fashion:
* commandAlt_CommandName
* Example:
* commandAlt_newGame, commandAlt_continue, commandAlt_options	
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Compatibility fix with plugins that disable command menu when press start
* 		is disabled.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_SimpleTitleScreen');
	var paramDisplayCursor = (parameters['Display Cursor'] || "true").toLowerCase() === "true";
	var paramDisplayAlternative = (parameters['Display Alternative'] || "true").toLowerCase() === "true";
	var paramDisplayBehind = (parameters['Display Behind'] || "true").toLowerCase() === "true";
	var paramDisplayPressStart = (parameters['Display Press Start'] || "true").toLowerCase() === "true";
	var paramCommandsPos = String(parameters['Commands Position'] || "561 400");
	var paramPressStartPos = String(parameters['Press Start Position'] || "561 580");
	var paramCursorOffset = String(parameters['Cursor Offset'] || "-60 0");
	var paramBehindOffset = String(parameters['Behind Offset'] || "-100 0");

	var _WindowTitleCommand_initialize = Window_TitleCommand.prototype.initialize;
	Window_TitleCommand.prototype.initialize = function() {
		this._commandSprites = [];
		this._altSprites = [];
		_WindowTitleCommand_initialize.call(this);
		this.openness = 255;
		var pos = paramCommandsPos.split(' ');
		this.x = Number(pos[0]);
		this.y = Number(pos[1]);
		this.opacity = 0;
	};

	Window_TitleCommand.prototype.setupSprites = function() {
		for (var i = 0; i < this._list.length; i++) {
			var rect = this.itemRect2(i);
			var spr = new Sprite();
			var symbol = this._list[i].symbol;
			spr.bitmap = ImageManager.loadSystem("command_"+symbol);
			spr.x = this.standardPadding();
			spr.y = rect.y + this.standardPadding();
			this._commandSprites.push(spr);
			this.addChild(spr);

			if (paramDisplayAlternative)
			{
				var spr2 = new Sprite();
				spr2.bitmap = ImageManager.loadSystem("commandAlt_"+symbol);
				spr2.x = this.standardPadding();
				spr2.y = rect.y + this.standardPadding();
				this._altSprites.push(spr2);
				spr2.visible = false;
				this.addChild(spr2);
			}

		}
		this.select(this.index());
	};

	var _WindowTitleCommand_select = Window_TitleCommand.prototype.select
	Window_TitleCommand.prototype.select = function(index) {
		_WindowTitleCommand_select.call(this, index);
		if (paramDisplayAlternative)
		{
			if (this._commandSprites[index] && this._altSprites[index])
			{
				for (var i = 0; i < this._commandSprites.length; i++) {
					this._commandSprites[i].visible = true;
					this._altSprites[i].visible = false;
				}
				this._commandSprites[index].visible = false;
				this._altSprites[index].visible = true;
			}
		}
	};

	Window_TitleCommand.prototype.drawItem = function(index) {
	};

	Window_TitleCommand.prototype.updateCursor = function() {
        this.setCursorRect(0, 0, 0, 0);
	};

	Window_TitleCommand.prototype.itemRect2 = function(index) {
	    var rect = new Rectangle();
	    var maxCols = this.maxCols();
	    rect.width = this.itemWidth();
	    rect.height = this.itemHeight();
	    rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
	    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
	    return rect;
	};

	Window_TitleCommand.prototype.itemRect = function(index) {
		if (!this._commandSprites[index]) return this.itemRect2(index);
	    var rect = new Rectangle();
	    rect.width = this._commandSprites[index].width;
	    rect.height = this._commandSprites[index].height
	    rect.x = this._commandSprites[index].x - this.standardPadding();
	    rect.y = this._commandSprites[index].y - this.standardPadding();
	    return rect;
	};

	Window_TitleCommand.prototype.close = function() {
	};

	var _SceneTitle_createCommandWindow = Scene_Title.prototype.createCommandWindow;
	Scene_Title.prototype.createCommandWindow = function() {
		_SceneTitle_createCommandWindow.call(this);
		this._commandWindow.setupSprites();
		if (paramDisplayPressStart)
		{
			this._commandWindow.hide();
			this._commandWindow.deactivate();
		}
	};

	var _SceneTitle_createBackground = Scene_Title.prototype.createBackground;
	Scene_Title.prototype.createBackground = function() {
		_SceneTitle_createBackground.call(this);

		if (paramDisplayBehind)
		{
			this._behindPos = paramBehindOffset.split(' ');
			this._behindSpr = new Sprite();
			this._behindSpr.bitmap = ImageManager.loadSystem("titleBehindCommand");
			this.addChild(this._behindSpr);
		}

		if (paramDisplayCursor)
		{
			this._cursorPos = paramCursorOffset.split(' ');
			this._cursorSpr = new Sprite();
			this._cursorSpr.bitmap = ImageManager.loadSystem("titleCursor");
			this.addChild(this._cursorSpr);
		}

		if (paramDisplayPressStart)
		{
			this._pressStartSpr = new Sprite();
			this._pressStartSpr.bitmap = ImageManager.loadSystem("titlePressStart");
			var pos = paramPressStartPos.split(" ");
			this._pressStartSpr.x = Number(pos[0]);
			this._pressStartSpr.y = Number(pos[1]);
			this.addChild(this._pressStartSpr);

			if (paramDisplayCursor) this._cursorSpr.visible = false;
			if (paramDisplayBehind) this._behindSpr.visible = false;
		}
	};

	var _SceneTitle_update = Scene_Title.prototype.update;
	Scene_Title.prototype.update = function() {
		_SceneTitle_update.call(this);
		if (!this._commandWindow.active && this._pressStartSpr && (Input.isTriggered('ok') || TouchInput.isTriggered()))
		{
			SoundManager.playOk();
			this._commandWindow.show();
			if (paramDisplayCursor) this._cursorSpr.visible = true;
			if (paramDisplayBehind) this._behindSpr.visible = true;
			this._commandWindow.active = true;
			this._pressStartSpr.visible = false;
		}

		var rect = this._commandWindow.itemRect(this._commandWindow.index());
		if (paramDisplayCursor)
		{
			this._cursorSpr.x = this._commandWindow.x + Number(this._cursorPos[0]) + rect.x + this._commandWindow.standardPadding();
			this._cursorSpr.y = this._commandWindow.y + Number(this._cursorPos[1]) + rect.y + this._commandWindow.standardPadding();
		}

		if (paramDisplayBehind)
		{
			this._behindSpr.x = this._commandWindow.x + Number(this._behindPos[0]) + rect.x + this._commandWindow.standardPadding();
			this._behindSpr.y = this._commandWindow.y + Number(this._behindPos[1]) + rect.y + this._commandWindow.standardPadding();
		}
	};

})();
