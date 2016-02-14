//=============================================================================
// MrTS_HpEqualsMaxHp.js
//=============================================================================

/*:
* @plugindesc Allows specific states to make actor's Max HP equal to HP.
* @author Mr. Trivel
*
* @param State List
* @desc List all State IDs separated by space that make actor's Max HP to be equal to HP.
* @default 12
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
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_HpEqualsMaxHp');
	var paramStateList = String(parameters['State List'] || "12");
	var paramStateList = paramStateList.split(' ');
	var paramStateIdList = [];
	for (var i = 0; i < paramStateList.length; i++) {
		paramStateIdList.push(Number(paramStateList[i]));
	};

	var _GameBattlerBase_param = Game_BattlerBase.prototype.param;
	Game_BattlerBase.prototype.param = function(paramId) {
		var value = _GameBattlerBase_param.call(this, paramId);
		if (paramId === 0 && this.isHpEqualsMaxHpStateInflicted())
			value = value.clamp(this.paramMin(paramId), this.hp <= 0 ? 1 : this.hp);
		return value;
	};

	Game_BattlerBase.prototype.isHpEqualsMaxHpStateInflicted = function() {
		for (var i = 0; i < paramStateIdList.length; i++) {
			if (this.isStateAffected(paramStateIdList[i])) return true;
		};
		return false;
	};
})();
