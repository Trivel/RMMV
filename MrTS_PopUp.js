//=============================================================================
// MrTS_PopUp.js
//=============================================================================

/*:
* @plugindesc Creates pop ups on item pick ups or custom ones as needed.
* @author Mr. Trivel
*
* @param Pop Speed
* @desc How fast popup goes upwards.
* Default: 2
* @default 2
*
* @param Pop Delay
* @desc Delay between popups, if there's more than one at once.
* Default: 15
* @default 15
*
* @param Pop Fade Out
* @desc How fast popup fades out?
* Default: 30
* @default 30
*
* @param Pop Font Type
* @desc Default font to use?
* Default: GameFont
* @default GameFont
*
* @param Pop Font Size
* @desc Default font size to use?
* Default: 28
* @default 28
*
* @param Gold Icon
* @desc Icon Index for Gold?
* Default: 17
* @default 17
*
* @param Quantity Sign
* @desc How should item quantity shown?
* Default: x
* @default x
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.3
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Plugin Calls
* --------------------------------------------------------------------------------
* CreatePopup [Icon Index] [Icon Allignment] [Text] 
* ---
* Icon Index - index of the icon to show, 0 to not show any
* Text - text to show, can use escape characters like \n[1]
* Icon Allignment - is icon onon Left or Right side of the popup, left by default
* 
* Examples: 
* CreatePopup 23 left Reputation +\v[20]
* CreatePopup 17 right Memories gone
*
* ---
* StopPopups - disables popups
* StartPopups - enables popups
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.3 - Fixed StopPopups command.
* 1.2 - Crash fixes.
* 1.1 - Showing quantity when more than 1 item is obtained.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_PopUp');
	var paramPopSpeed = Number(parameters['Pop Speed'] || 2);
	var paramPopDelay = Number(parameters['Pop Delay'] || 15);
	var paramPopFadeOut = Number(parameters['Pop Fade Out'] || 30);
	var paramPopFontType = String(parameters['Pop Font Type'] || "GameFont");
	var paramPopFontSize = Number(parameters['Pop Font Size'] || 28);
	var paramGoldIcon = Number(parameters['Gold Icon'] || 17);
	var paramQuantitySign = String(parameters['Quantity Sign'] || 'x');

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "createpopup") {
			var iconIndex = Number(args[0]);
			var iconAllign = String(args[1]).toLowerCase();
			var text = "";
			for (var i = 2; i < args.length; i++) {
				text += args[i] + " ";
			}

			$gameSystem.createPopup(iconIndex, iconAllign, text);
		}
		else if (command.toLowerCase() === "stoppopups")
		{
			$gameSystem.stopPopups();
		}
		else if (command.toLowerCase() === "startpopups")
		{
			$gameSystem.startPopups();
		}
	};

	//--------------------------------------------------------------------------
	// Game_System

	Game_System.prototype.stopPopups = function() {
		this._popupsAlive = false;
	};

	Game_System.prototype.startPopups = function() {
		this._popupsAlive = true;
	};

	Game_System.prototype.arePopupsAlive = function() {
		if (this._popupsAlive === undefined) this._popupsAlive = true;
		return this._popupsAlive;
	};

	Game_System.prototype.createPopup = function(iconIndex, iconAllign, text) {
		if (SceneManager._scene.constructor !== Scene_Map) return;
		if (!this.arePopupsAlive()) return;
		SceneManager._scene.queuePopup(iconIndex, iconAllign, text);
	};

	//--------------------------------------------------------------------------
	// Game Party

	var _GameParty_gainItem = Game_Party.prototype.gainItem;
	Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
		_GameParty_gainItem.call(this, item, amount, includeEquip);
		if (amount > 0 && item) {
			var text = item.name + (amount > 1 ? " " + paramQuantitySign + "" + amount : "");
			$gameSystem.createPopup(item.iconIndex, "left", text);
		}
	};

	var _GameParty_gainGold = Game_Party.prototype.gainGold;
	Game_Party.prototype.gainGold = function(amount) {
		_GameParty_gainGold.call(this, amount);
		if (amount > 0) $gameSystem.createPopup(paramGoldIcon, "left", String(amount));
	};

	//--------------------------------------------------------------------------
	// Scene_Map

	var _SceneMap_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
	Scene_Map.prototype.createDisplayObjects = function() {
		_SceneMap_createDisplayObjects.call(this);
		this._popupQueue = [];
		this._popups = [];
		this._popDelay = 0;
	};

	Scene_Map.prototype.queuePopup = function(iconIndex, iconAllign, text) {
		var popup = this.createBlankPopup();
		popup.iconIndex = iconIndex;
		popup.iconAllign = iconAllign;
		popup.text = text;
		this._popupQueue.push(popup);
	};

	Scene_Map.prototype.createBlankPopup = function() {
		var blank = {};
		blank.iconIndex = 0;
		blank.iconAllign = "left";
		blank.text = "";
		return blank;
	};

	var _SceneMap_update = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() {
		_SceneMap_update.call(this);
		if (this._popDelay > 0) this._popDelay--;
		if(this._popupQueue.length > 0 && this._popDelay <= 0)
		{
			var popup = new Window_PopUp(this._popupQueue[0], $gamePlayer.screenX(), $gamePlayer.screenY());
			this._popupQueue.shift();
			this._popups.push(popup);
			this.addChild(popup);
			this._popDelay = paramPopDelay;
		}
		if(this._popups.length > 0)
		{
			for (var i = this._popups.length - 1; i >= 0; i--) {
				this._popups[i].y -= paramPopSpeed;
				this._popups[i].alpha -= 1/paramPopFadeOut;
				if (this._popups[i].alpha < 0) {
					this.removeChild(this._popups[i]);
					this._popups.splice(this._popups.indexOf(this._popups[i]), 1);
				} 
			}
		}
	};

	//--------------------------------------------------------------------------
	// Window_PopUp
	//
	// Window to show pop up details.
	
	function Window_PopUp() {
		this.initialize.apply(this, arguments);	
	};
	
	Window_PopUp.prototype = Object.create(Window_Base.prototype);
	Window_PopUp.prototype.constructor = Window_PopUp;
	
	Window_PopUp.prototype.initialize = function(popup, x, y) {
		this._popup = popup;
		Window_Base.prototype.initialize.call(this, x, y, 200, this.fittingHeight(1));
		var popupTextWidth = this.textWidthEx(popup.text) + Window_Base._iconWidth + 4;
		this.width = popupTextWidth + this.standardPadding()*2;
		this.x -= this.width/2;
		this.y -= 48*2;
		this.opacity = 0;
		this.refresh();
	};
	
	Window_PopUp.prototype.refresh = function() {
    	this.createContents();
		var x = this._popup.iconAllign === "left" ? 0 : this.contentsWidth() - Window_Base._iconWidth;
		this.drawTextEx(this._popup.text, x > 0 ? 0 : Window_Base._iconWidth, 0);
		this.drawIcon(this._popup.iconIndex, x-2, 2);
	};

	Window_PopUp.prototype.standardFontFace = function() {
		return paramPopFontType;
	};

	Window_PopUp.prototype.standardFontSize = function() {
		return paramPopFontSize;
	};

	Window_PopUp.prototype.textWidthEx = function(text) {
	    return this.drawTextEx(text, 0, this.contents.height);
	};
})();
