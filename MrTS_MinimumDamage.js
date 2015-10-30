//==============================================================================
// MrTS_MinimumDamage.js
//==============================================================================

/*:
* @plugindesc Changes minimum damage from 0.
* @author Mr. Trivel
* 
* @param Minimum Damage
* @desc Minimum Damage possible.
* @default 1
* 
* @help Free for commercial and non-commercial use.
* Version 1.0
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_DamagePostfix');
	var minDamage = Number(parameters['Minimum Damage'] || 1);

	var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;

	Game_Action.prototype.makeDamageValue = function(target, critical) {
		var value = _Game_Action_makeDamageValue.call(this, target, critical);
		return Math.max(value, minDamage);
	};
})();
