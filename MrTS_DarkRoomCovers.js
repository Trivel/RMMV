//=============================================================================
// MrTS_DarkRoomCovers.js
//=============================================================================

/*:
* @plugindesc Hides or reveals regions.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for non-commercial projects.
* For commercial use contact Mr. Trivel.
* --------------------------------------------------------------------------------
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Map Property Tags
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* RegionReveal [ID] - Reveals tiles of specific region
* RegionHide [ID] - Hides tiles of specific region
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "regionreveal") {
			$gameMap.setShowRegionId(Number(args[0]));
		} else if (command.toLowerCase() === "regionhide") {
			$gameMap.setHideRegionId(Number(args[0]));
		}
	};

	//----------------------------------------------------------------------------
	// Game_Map
	// 

	// showRegionId
	Game_Map.prototype.setShowRegionId = function(id) {
		if (!this._showRegionId) this._showRegionId = [];
		this._showRegionId.push(id);
		this.addToCurrentlyOpenRegions(id);
	};

	Game_Map.prototype.getShowRegionId = function() {
		if (!this._showRegionId) this._showRegionId = [];
		return this._showRegionId;
	};

	Game_Map.prototype.eraseShowRegionId = function() {
		this._showRegionId = [];
	};

	// hideRegionId
	Game_Map.prototype.setHideRegionId = function(id) {
		if (!this._hideRegionId) this._hideRegionId = [];
		this._hideRegionId.push(id);
		this.removeFromCurrentlyOpenRegions(id);
	};

	Game_Map.prototype.getHideRegionId = function() {
		if (!this._hideRegionId) this._hideRegionId = [];
		return this._hideRegionId;
	};

	Game_Map.prototype.eraseHideRegionId = function() {
		this._hideRegionId = [];
	};

	// currentlyOpenRegions
	Game_Map.prototype.currentlyOpenRegions = function() {
		if (!this._openRegionIds) this._openRegionIds = [];
		return this._openRegionIds;
	};

	Game_Map.prototype.addToCurrentlyOpenRegions = function(id) {
		if (!this._openRegionIds) this._openRegionIds = [];
		if (!this._openRegionIds.contains(id)) this._openRegionIds.push(id);
	};

	Game_Map.prototype.removeFromCurrentlyOpenRegions = function(id) {
		if (!this._openRegionIds) return;
		this._openRegionIds.splice(this._openRegionIds.indexOf(id), 1);
	};

	Game_Map.prototype.resetCurrentlyOpenRegions = function() {
		this._openRegionIds = [];
	};

	//----------------------------------------------------------------------------
	// Scene_Map
	// 

	var _SceneMap_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
	Scene_Map.prototype.createDisplayObjects = function() {
		_SceneMap_createDisplayObjects.call(this);
		this.createDarkCover();
	};

	Scene_Map.prototype.createDarkCover = function() {
		this._darkCover = new Spriteset_DarkCover();
		this._spriteset.addChild(this._darkCover);
	};

	//--------------------------------------------------------------------------
	// Spriteset_DarkCover
	//
	// Covers regions with dark dark darkness.
	
	function Spriteset_DarkCover() {
		this.initialize.apply(this, arguments);	
	};
	
	Spriteset_DarkCover.prototype = Object.create(Sprite.prototype);
	Spriteset_DarkCover.prototype.constructor = Spriteset_DarkCover;
	
	Spriteset_DarkCover.prototype.initialize = function() {
		Sprite.prototype.initialize.call(this);
		this.setFrame(0, 0, Graphics.width, Graphics.height);
		this._tone = [0, 0, 0, 0];
		this.opaque = true;
		this._darkCovers = [];
		this.createDarkCovers();
		this.update();
	};

	Spriteset_DarkCover.prototype.createDarkCovers = function() {
		var bitmap = new Bitmap(48, 48);
		bitmap.fillAll('#000000');
		for (var j = 0; j < $gameMap.height(); j++) {
			this._darkCovers.push([]);
			for (var i = 0; i < $gameMap.width(); i++) {
				var cover = new Sprite(bitmap);
				cover.x = i * 48;
				cover.y = j * 48;
				cover.visible = false;
				if ($gameMap.regionId(i, j) > 0)
				  	cover.visible = !$gameMap.currentlyOpenRegions().contains($gameMap.regionId(i, j));
				else
					cover.visible = false;
				this._darkCovers[j].push(cover);
				this.addChild(cover);
			}
		}
	};

	Spriteset_DarkCover.prototype.update = function() {
		Sprite.prototype.update.call(this);
		this.x = -$gameMap.displayX() * $gameMap.tileWidth();
		this.y = -$gameMap.displayY() * $gameMap.tileHeight();
		if ($gameMap.getShowRegionId().length > 0)
		{
			for (var j = 0; j < $gameMap.height(); j++) {
				for (var i = 0; i < $gameMap.width(); i++) {
					if ($gameMap.getShowRegionId().contains($gameMap.regionId(i, j)))
						this._darkCovers[j][i].visible = false;
				}
			}
			$gameMap.eraseShowRegionId();
		}
		if ($gameMap.getHideRegionId().length > 0)
		{
			for (var j = 0; j < $gameMap.height(); j++) {
				for (var i = 0; i < $gameMap.width(); i++) {
					if ($gameMap.getHideRegionId().contains($gameMap.regionId(i, j)))
						this._darkCovers[j][i].visible = true;
				}
			}
			$gameMap.eraseHideRegionId();
		}
	};
})();
