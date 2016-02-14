//=============================================================================
// MrTS_UseWeaponsArmorInBattle.js
//=============================================================================

/*:
* @plugindesc Allows to use Weapons and Armor to invoke skills in battle.
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
* Weapon/Armor tags
* -------------------------------------------------------------------------------- 
* Use the following tag for weapon or armor note fields:
* <BattleSkill: [ID], [CONSUMES]>
* Weapon or Armor will be treated as skill of [ID].
* [CONSUMES] - 0 - no, 1 - yes. Does it consume the item on use.
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_UseWeaponsArmorInBattle');
 
 	var _SceneBattle_onItemOk = Scene_Battle.prototype.onItemOk;
	Scene_Battle.prototype.onItemOk = function() {
	    var item = this._itemWindow.item();
	    if (item.meta.BattleSkill)
	    {
	    	var action = BattleManager.inputtingAction();
	    	var meta = item.meta.BattleSkill.split(',');

	    	action.setSkill(Number(meta[0]));
	    	action.setFree();
	    	action.setConsume(Number(meta[1]) === 1 ? item : null);
	    	$gameParty.setLastItem(item);
	    	this.onSelectAction();
	    }
	    else
	    {
	    	_SceneBattle_onItemOk.call(this);
	    }
	};

	var _WindowBattleItem_includes = Window_BattleItem.prototype.includes;
	Window_BattleItem.prototype.includes = function(item) {
	    return _WindowBattleItem_includes.call(this, item) || (item && item.meta.BattleSkill);
	};

	var _WindowBattleItem_isEnabled = Window_BattleItem.prototype.isEnabled;
	Window_BattleItem.prototype.isEnabled = function(item) {
	    return _WindowBattleItem_isEnabled(item) || (item && item.meta.BattleSkill);
	};

	Game_Action.prototype.setFree = function() {
	    this._freeSkill = true;
	};

	Game_Action.prototype.setConsume = function(item) {
		this._consumeItem = item;
	};

	Game_Action.prototype.isFree = function() {
		return this._freeSkill;
	};

	Game_Action.prototype.isConsumed = function() {
		return this._consumeItem;
	};

	var _GameAction_clear = Game_Action.prototype.clear;
	Game_Action.prototype.clear = function() {
		_GameAction_clear.call(this);
		this._freeSkill = false;
		this._consumeItem = null;
	};

	var _Game_BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
	Game_BattlerBase.prototype.paySkillCost = function(skill) {
		if (!this.currentAction().isFree())
			_Game_BattlerBase_paySkillCost.call(this, skill);
		if (this.currentAction().isConsumed())
			$gameParty.loseItem(this.currentAction().isConsumed(), 1);
	};
})();
