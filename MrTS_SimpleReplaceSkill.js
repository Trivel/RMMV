//=============================================================================
// MrTS_SimpleReplaceSkill.js
//=============================================================================

/*:
* @plugindesc Replace some skill when another skill is learned.
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
* To replace a skill when it's learned use the following tag:
* <ReplaceSkill: ID, ID, ..., ID>
* Any amount of IDs work.
*
* Example:
* <ReplaceSkill: 5, 7, 9>
* <ReplaceSkill: 5>
*
* First example would remove skills 5, 7 and 9 after learning.
* Second example would remove skill 5 after learning.
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var _Game_Actor_learnSkill = Game_Actor.prototype.learnSkill;
	Game_Actor.prototype.learnSkill = function(skillId) {
		if (!this.isLearnedSkill(skillId) && $dataSkills[skillId].meta.ReplaceSkill) {
			var a = $dataSkills[skillId].meta.ReplaceSkill.split(",");
			for (var i = 0; i < a.length; i++) {
				this.forgetSkill(Number(a[i]));
			}
		}
		_Game_Actor_learnSkill.call(this, skillId);
	};
})();
