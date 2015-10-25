//==============================================================================
// MrTS_RareEnemies.js
//==============================================================================

/*:
* @plugindesc Adds a chance of encountering rare versions of enemies.
* @author Mr. Trivel
*
* @help This plugin does not provide plugin commands.
* Version 1.0
*
* It requires two commands used in enemies note fields:
* <re_id: X> - ID of rare enemy
* <re_chc: Y.YY> - Chance of appearing - 0.01 - 1%, 1.00 - 100%, 0.5 - 50%
*/

(function() {
	var _Game_Enemy_setup = Game_Enemy.prototype.setup;

	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		_Game_Enemy_setup.call(this, enemyId, x, y);
		var chance = Number(this.enemy().meta.re_chc);
		if (Math.random() < chance)
		{
			this._enemyId = Number(this.enemy().meta.re_id);
		}

	};
})();
