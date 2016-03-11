//==============================================================================
// MrTS_RareEnemies.js
//==============================================================================

/*:
* @plugindesc Adds a chance of encountering rare versions of enemies.
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
* It requires two commands used in enemies note fields:
* <re_id: X> - ID of rare enemy
* <re_chc: Y.YY> - Chance of appearing - 0.01 - 1%, 1.00 - 100%, 0.5 - 50%
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Fixed rare enemy retaining old id's HP.
* 1.0 - Release
*/

(function() {
	var _Game_Enemy_setup = Game_Enemy.prototype.setup;

	Game_Enemy.prototype.setup = function(enemyId, x, y) {
		if ($dataEnemies[enemyId].meta.re_chc)
		{
			var chance = Number($dataEnemies[enemyId].meta.re_chc);
			if (Math.random() < chance)
			{
				enemyId = Number($dataEnemies[enemyId].meta.re_id);
			}
		}
		_Game_Enemy_setup.call(this, enemyId, x, y);
		

	};
})();
