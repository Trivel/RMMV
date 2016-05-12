//=============================================================================
// MrTS_PassiveSkills.js
//=============================================================================

/*:
* @plugindesc Allows skills to give passive bonuses to actors.
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
* Skill Tags
* --------------------------------------------------------------------------------
* Use the following tag:
* <Passive: [STATE_ID]>
* This means skill will give all bonuses state with that ID gives.
*
* Example:
* <Passive: 11>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {

	var _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
	Game_Actor.prototype.initMembers = function() {
		_Game_Actor_initMembers.call(this);
		this._skipPassives = false;
	};
	var _Game_Actor_traitObjects = Game_Actor.prototype.traitObjects;
	Game_Actor.prototype.traitObjects = function() {
		var objects = _Game_Actor_traitObjects.call(this);
		if (!this._skipPassives)
			objects = objects.concat(this.getPassiveSkills());
		return objects;
	};

	Game_Actor.prototype.getPassiveSkills = function() {
		var passives = [];
		this._skipPassives = true;
		var skills = this.skills();
		for (var i = 0; i < skills.length; i++) {
			var skill = skills[i];
			if (skill.meta.Passive) {
				passives.push($dataStates[Number(skill.meta.Passive)]);
			}
		}
		this._skipPassives = false;
		return passives;
	};
})();
