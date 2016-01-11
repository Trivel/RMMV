//=============================================================================
// MrTS_EnemyPositions.js
//=============================================================================

/*:
* @plugindesc Allows to change enemy positions through adding tags.
* @author Mr. Trivel
*
* @param Spawn Rule
* @desc Should enemies NOT spawn on same position if no other spots are available? True/False
* @default True
* 
* @help 
* --------------------------------------------------------------------------------
* Free for commercial and non commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Enemy Tags
* --------------------------------------------------------------------------------
* Use following tags inside enemy note fields. In case of multiple tags - tag at
* random will be picked.
* <Position: [X] [Y]>
* E.g.: <Position: 500 200>
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_EnemyPositions');
	var paramSpawnRule = String(parameters['Spawn Rule'] || "true");
	paramSpawnRule = Boolean(paramSpawnRule.toLowerCase() === "true")

	var _GameTroop_setup = Game_Troop.prototype.setup;
	Game_Troop.prototype.setup = function(troopId) {
		_GameTroop_setup.call(this, troopId);
		this.reshuffleEnemies();
	};

	Game_Troop.prototype.reshuffleEnemies = function() {
		this.resetEnemyPositionsSpecial();

		for (var i = 0; i < this._enemies.length; i++) {
			var enemy = this._enemies[i].enemy();
			if (enemy.meta.Position)
			{
				var note = enemy.note.split(/[\r\n]/);
				var positions = [];
				var lastPosition = [];
				var regex = /<Position:[ ]*(.*)>/;
				for (var j = 0; j < note.length; j++)
				{
					var regexMatch = regex.exec(note[j]);
					if (regexMatch)
						positions.push(regexMatch[1]);
				};

 				var l = positions.length;
				for (var j = 0; j < l; j++)
				{
					var newPosition = positions[Math.floor(Math.random()*positions.length)];
					var newCoordinates = newPosition.split(' ');
					lastPosition = newCoordinates;
					var newX = Number(newCoordinates[0]);
					var newY = Number(newCoordinates[1]);
					if (this.enemyExistsAtPos(newX, newY))
					{
						positions.splice(positions.indexOf(newPosition), 1);
					}
					else
					{
						this._enemies[i]._screenX = newX;
						this._enemies[i]._screenY = newY;
						break;
					}
				};

				if (positions.length === 0)
				{
					if (paramSpawnRule)
					{
						this._enemies.splice(i, 1);
						i--;
					}
					else
					{
						var newX = Number(lastPosition[0]);
						var newY = Number(lastPosition[1]);
						this._enemies[i]._screenX = newX;
						this._enemies[i]._screenY = newY; 
					}
				}
			}
		};

		// Remake names just in case
		this.makeUniqueNames();
	};

	Game_Troop.prototype.enemyExistsAtPos = function(x, y) {
		for (var i = 0; i < this._enemies.length; i++) {
			if (this._enemies[i].screenX() === x && this._enemies[i].screenY() === y)
				return true;
		};

		return false;
	};

	Game_Troop.prototype.resetEnemyPositionsSpecial = function() {
		for (var i = 0; i < this._enemies.length; i++) {
			if (!this._enemies[i].enemy().meta.Position) continue;
			this._enemies[i]._screenX = -100;
			this._enemies[i]._screenY = -100;
		};
	};
})();
