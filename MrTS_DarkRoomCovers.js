//=============================================================================
// MrTS_DarkRoomCovers.js
//=============================================================================

/*:
* @plugindesc Hides or reveals regions.
* @author Mr. Trivel
*
* @param Tile Size
* @desc How big are map tiles? X Y
* Default: 48 48
* @default 48 48
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
* RegionReset - Resets all open regions
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Performance issues fixed, code cleanup
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_DarkRoomCovers');
	var paramTileSize = String(parameters['Tile Size'] || "48 48").split(' ');
	var tileSizeX = Number(paramTileSize[0]);
	var tileSizeY = Number(paramTileSize[1]);

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "regionreveal") {
			$gameMap.addToCurrentlyOpenRegions(Number(args[0]));
		} else if (command.toLowerCase() === "regionhide") {
			$gameMap.removeFromCurrentlyOpenRegions(Number(args[0]));
		} else if (command.toLowerCase() === "regionreset") {
			$gameMap.resetCurrentlyOpenRegions();
		}
	};

	//----------------------------------------------------------------------------
	// Game_Map
	// 
	
	// currentlyOpenRegions
	Game_Map.prototype.currentlyOpenRegions = function() {
		if (!this._openRegionIds) this._openRegionIds = [0];
		return this._openRegionIds;
	};

	Game_Map.prototype.addToCurrentlyOpenRegions = function(id) {
		if (!this._openRegionIds) this._openRegionIds = [0];
		if (!this._openRegionIds.contains(id)) this._openRegionIds.push(id);
	};

	Game_Map.prototype.removeFromCurrentlyOpenRegions = function(id) {
		if (!this._openRegionIds) return;
		this._openRegionIds.splice(this._openRegionIds.indexOf(id), 1);
	};

	Game_Map.prototype.resetCurrentlyOpenRegions = function() {
		this._openRegionIds = [0];
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
		this._displayX = 0;
		this._displayY = 0;
		this._regions = $gameMap.currentlyOpenRegions().clone();
		this.createDarkCovers();
		this.update();
	};

	Spriteset_DarkCover.prototype.createDarkCovers = function() {
		var bitmap = new Bitmap(tileSizeX, tileSizeY);
		bitmap.fillAll('#000000');
		for (var j = -1; j < Math.ceil(Graphics.boxHeight/tileSizeY)+2; j++) {
			this._darkCovers.push([]);
			for (var i = -1; i < Math.ceil(Graphics.boxWidth/tileSizeX)+2; i++) {
				var cover = new Sprite(bitmap);
				cover.x = i * tileSizeX;
				cover.y = j * tileSizeY;
				var regionId = $gameMap.regionId(i+this._displayX, j+this._displayY);
				cover.visible = !(this._regions.contains(regionId));
				this._darkCovers[j+1].push(cover);
				this.addChild(cover);
			}
		}
	};

	Spriteset_DarkCover.prototype.update = function() {
		Sprite.prototype.update.call(this);
		this.x = (-$gameMap.displayX() + Math.floor($gameMap.displayX())) * tileSizeX;
		this.y = (-$gameMap.displayY() + Math.floor($gameMap.displayY())) * tileSizeY;
		if (Math.floor($gameMap.displayX()) !== this._displayX || 
			Math.floor($gameMap.displayY()) !== this._displayY ||
			!$gameMap.currentlyOpenRegions().equals(this._regions))
		{
			this._displayX = Math.floor($gameMap.displayX());
			this._displayY = Math.floor($gameMap.displayY());
			this._regions = $gameMap.currentlyOpenRegions().clone();
			for (var j = -1; j < Math.ceil(Graphics.boxHeight/tileSizeY)+2; j++) {
				for (var i = -1; i < Math.ceil(Graphics.boxWidth/tileSizeX)+2; i++) {
					var regionId = $gameMap.regionId(i+this._displayX, j+this._displayY);
					this._darkCovers[j+1][i+1].visible = !(this._regions.contains(regionId));
				}
			}
		}
	};
})();
