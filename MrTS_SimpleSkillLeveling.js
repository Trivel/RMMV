//=============================================================================
// MrTS_SimpleSkillLeveling.js
//=============================================================================

/*:
* @plugindesc Skills change to stronger version of themselves after X uses.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for non-commercial projects.
* For commercial use contact Mr. Trivel.
* --------------------------------------------------------------------------------
* Version 1.0
* --------------------------------------------------------------------------------
** 
* --------------------------------------------------------------------------------
* Skill Tags
* --------------------------------------------------------------------------------
* To make skill change after some uses, use the following tag:
* <LevelUpTo: [ID], [USES]>
* [ID] - Skill ID to change to
* [USES] - After how many uses change into that skill
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var _GameActor_initMembers = Game_Actor.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		_GameActor_initMembers.call(this);
	    Game_Battler.prototype.initMembers.call(this);
	    this._leveledSkills = {};
	};

	var _GameActor_learnSkill = Game_Actor.prototype.learnSkill;
	Game_Actor.prototype.learnSkill = function(skillId) {
		if (!this.isLearnedSkill(skillId) && $dataSkills[skillId].meta.LevelUpTo)
		{
			this._leveledSkills[skillId] = 0;
		}
		_GameActor_learnSkill.call(this, skillId);
	};

	Game_Actor.prototype.increaseSkillUsage = function(skill) {
		if (!skill.meta.LevelUpTo)
			return;

		var data = skill.meta.LevelUpTo.split(",");
		var lto  = Number(data[0]);
		var uses = Number(data[1]);

		this._leveledSkills[skill.id]++;
		if (this._leveledSkills[skill.id] >= uses)
		{
			this._leveledSkills[skill.id] = 0;
			this.forgetSkill(skill.id);
			this.learnSkill(lto);
		}
	};

	var _GameAction_apply = Game_Action.prototype.apply;
	Game_Action.prototype.apply = function(target) {
		_GameAction_apply.call(this, target);
		if (this.subject().isActor() && DataManager.isSkill(this.item()))
		{
			this.subject().increaseSkillUsage(this.item());
		}
	};
})();
