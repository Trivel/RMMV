//=============================================================================
// MrTS_RegionTransfer.js
//=============================================================================

/*:
* @plugindesc Transfers player when stepping on a region.
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
* Map Note Field
* --------------------------------------------------------------------------------
* Use the following tag in map properties note field:
* <RegionTransfer: [RegionId], [MapId], [X], [Y], [Direction]>
*
* RegionTransfer transfers player to specific map with X and Y positions.
*
* [RegionId] - ID of the region that will be affected.*
* [MapId] - ID of map
* [X] - X position
* [Y] - Y position
* [Direction] - which direction does player face after the transfer?
*             - 2 - up, 4 - left, 6 - right, 8 - up, 0 - same as pre-transfer
*
* Example:
* <RegionTransfer: 2, 2, 5, 10, 6>
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var _GameMap_setup = Game_Map.prototype.setup;
	Game_Map.prototype.setup = function(mapId) {
		_GameMap_setup.call(this, mapId);
		this._regionTransferData = {};
		this.parseRegionTransfers();
	};

	Game_Map.prototype.parseRegionTransfers = function() {
		var note = $dataMap.note.split(/[\r\n]/);
		var regexTransfer = /<RegionTransfer:[ ]*(\d+),[ ]*(\d+),[ ]*(\d+),[ ]*(\d+),[ ]*(\d+)>/i;

		for (var i = 0; i < note.length; i++) {
			var regionTransferMatch = regexTransfer.exec(note[i])
			if (regionTransferMatch)
			{
				var regionId = Number(regionTransferMatch[1]);
				var mapId = Number(regionTransferMatch[2]);
				var newX = Number(regionTransferMatch[3]);
				var newY = Number(regionTransferMatch[4]);
				var direction = Number(regionTransferMatch[5]);
				this._regionTransferData[regionId] = [mapId, newX, newY, direction];
			}
		}
	};

	Game_Map.prototype.validTransferRegionExistsAt = function(id) {
		return this._regionTransferData[id];
	};

	var _GamePlayer_moveStraight = Game_Player.prototype.moveStraight;
	Game_Player.prototype.moveStraight = function(d) {
		_GamePlayer_moveStraight.call(this, d);
		var data = $gameMap.validTransferRegionExistsAt(this.regionId());
		if (data)
		{
			this.reserveTransfer(data[0], data[1], data[2], data[3] === 0 ? d : data[3], 0);
		}
	};
})();
