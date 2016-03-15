//=============================================================================
// MrTS_RestoreHpMpTp.js
//=============================================================================

/*:
* @plugindesc Allows to have equipment/states that restore HP/MP/TP after battles or level ups.
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
* Trait Objects Tags (Actor/Class/Weapon/Armor/State)
* --------------------------------------------------------------------------------
* HP:
* <RestoreAfterBattleHP: [AMOUNT]>
* <RestoreAfterBattleHPPercent: [PERCENT AMOUNT]>
*
* <RestoreAfterLevelUpHP: [AMOUNT]>
* <RestoreAfterLevelUpHPPercent: [PERCENT AMOUNT]>
*
* MP:
* <RestoreAfterBattleMP: [AMOUNT]>
* <RestoreAfterBattleMPPercent: [PERCENT AMOUNT]>
*
* <RestoreAfterLevelUpMP: [AMOUNT]>
* <RestoreAfterLevelUpMPPercent: [PERCENT AMOUNT]>
*
* TP:
* <RestoreAfterBattleTP: [AMOUNT]>
* <RestoreAfterBattleTPPercent: [PERCENT AMOUNT]>
*
* <RestoreAfterLevelUpTP: [AMOUNT]>
* <RestoreAfterLevelUpTPPercent: [PERCENT AMOUNT]>
*
* RestoreAfterBattle - restores HP/MP/TP after a won battle.
* RestoreAfterLevelUp - restores HP/MP/TP after a level up.
* [AMOUNT] - flat amount E.g. 10, 100, 1000, 50, 37
* [PERCENT AMOUNT] - uses floating point E.g. 0.53 being 53%, 1.0 being 100%
* 
* Examples:
* <RestoreAfterBattleTP: 50>
* <RestoreAfterBattleHP: 15>
* <RestoreAfterBattleHPPercent: 0.05>
* <RestoreAfterBattleMPPercent: 0.10>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	Game_Actor.prototype.restoreAfterType = function(type) {
		var valueHp = 0;
		var valueHpP = 0.0;
		var valueMp = 0;
		var valueMpP = 0.0;
		var valueTp = 0;
		var valueTpP = 0.0;
		var traitObjects = this.traitObjects();

		for (var i = 0; i < traitObjects.length; i++) {
			switch(type)
			{
				case 'battle':
				{
					valueHp += Number(traitObjects[i].meta.RestoreAfterBattleHP) || 0;
					valueHpP += Number(traitObjects[i].meta.RestoreAfterBattleHPPercent) || 0;

					valueMp += Number(traitObjects[i].meta.RestoreAfterBattleMP) || 0;
					valueMpP += Number(traitObjects[i].meta.RestoreAfterBattleMPPercent) || 0;

					valueTp += Number(traitObjects[i].meta.RestoreAfterBattleTP) || 0;
					valueTpP += Number(traitObjects[i].meta.RestoreAfterBattleTPPercent) || 0;
				} break;
				case 'levelup':
				{
					valueHp += Number(traitObjects[i].meta.RestoreAfterLevelUpHP) || 0;
					valueHpP += Number(traitObjects[i].meta.RestoreAfterLevelUpHPPercent) || 0;

					valueMp += Number(traitObjects[i].meta.RestoreAfterLevelUpMP) || 0;
					valueMpP += Number(traitObjects[i].meta.RestoreAfterLevelUpMPPercent) || 0;

					valueTp += Number(traitObjects[i].meta.RestoreAfterLevelUpTP) || 0;
					valueTpP += Number(traitObjects[i].meta.RestoreAfterLevelUpTPPercent) || 0;
				} break;
			}
		}

		var totalHp = valueHp + Math.floor(this.mhp * valueHpP);
		var totalMp = valueMp + Math.floor(this.mmp * valueMpP);
		var totalTp = valueTp + Math.floor(100 * valueTpP);
		console.log(valueHp, valueMp, valueTp);
		this.gainHp(totalHp);
		this.gainMp(totalMp);
		this.gainTp(totalTp);
	};

	var _GameActor_levelUp = Game_Actor.prototype.levelUp;
	Game_Actor.prototype.levelUp = function() {
		_GameActor_levelUp.call(this);
		this.restoreAfterType('levelup');
	};

	var _BattleManager_processVictory = BattleManager.processVictory;
	BattleManager.processVictory = function() {
		_BattleManager_processVictory.call(this);
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			$gameParty.battleMembers()[i].restoreAfterType('battle');
		}
	};
})();
