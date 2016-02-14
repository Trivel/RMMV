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
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_DamagePostfix');
	var minDamage = Number(parameters['Minimum Damage'] || 1);

	var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;

	Game_Action.prototype.makeDamageValue = function(target, critical) {
		var value = _Game_Action_makeDamageValue.call(this, target, critical);
		return (value >= 0 ? Math.max(value, minDamage) : value);
	};
})();
