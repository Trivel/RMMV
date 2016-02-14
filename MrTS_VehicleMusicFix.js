//=============================================================================
// MrTS_VehicleMusicFix.js
//=============================================================================

/*:
* @plugindesc Changes how music and vehicles work.
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
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* After boarding onto a vehicle and going to a new map, it'd play the autoplay
* BGM there. Now it keeps vehicle BGM playing.
*
* After boaring onto a vehicle in one map and leaving it in another, it'd play the
* BGM from previous map. Now it plays the BGM of the map which you left vehicle.
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	var _GameMap_autoplay = Game_Map.prototype.autoplay;
	Game_Map.prototype.autoplay = function() {
		if (!$gamePlayer.isInVehicle())
			_GameMap_autoplay.call(this);
	};

	var _GameVehicle_getOn = Game_Vehicle.prototype.getOn;
	Game_Vehicle.prototype.getOn = function() {
	    _GameVehicle_getOn.call(this);
	    this._boardedOnMapId = $gameMap.mapId();
	};

	var _GameVehicle_getOff = Game_Vehicle.prototype.getOff;
	Game_Vehicle.prototype.getOff = function() {
		_GameVehicle_getOff.call(this);
		if (this._boardedOnMapId !== $gameMap.mapId())
			_GameMap_autoplay.call($gameMap);
	};
})();
