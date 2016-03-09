//=============================================================================
// MrTS_CriticalDamage.js
//=============================================================================

/*:
* @plugindesc Changes how critical damage works. No more Damage * 3.
* @author Mr. Trivel
*
* @param Base Multiplier
* @desc Starting multiplier for critical hits. 2.0 = 200%, 1.5 = 150%
* Default: 2.0
* @default 2.0
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
* --------------------------------------------------------------------------------
* Actor/Enemy Tags
* --------------------------------------------------------------------------------
* For actors which have their base Critical Damage Multiplier different from
* one defined in plugin parameter.
* Can't be negative number.
* <CritMultiplier: [FLOAT]>
*
* Example:
* <CritMultiplier: 5.0>
* <CritMultiplier: 1.7>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Class Tags
* --------------------------------------------------------------------------------
* For classes which have their base Critical Damage Multiplier differenet from
* one defined in plugin paramater or actor tags.
* Can't be negative number.
* <CritMultiplier: [FLOAT]>
*
* Example:
* <CritMultiplier: 1.3>
* <CritMultiplier: 2.1>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* State Tags
* --------------------------------------------------------------------------------
* While character has the state and it has the following tag in it, it'll increase
* character's crit damage multiplier by that amount.
* If number is negative, it'll decrease multiplier by that amount instead.
* <CritMultiplier: [FLOAT]>
*
* Example:
* <CritMultiplier: 0.2>
* <CritMultiplier: -1.0>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Equipment Tags
* --------------------------------------------------------------------------------
* While actor has item equipped and it has the following tag in it, it'll increase
* character's crit damage multiplier by that amount.
* If number is negative, it'll decrease multiplier by that amount instead.
* <CritMultiplier: [FLOAT]>
*
* Example:
* <CritMultiplier: 0.1>
* <CritMultiplier: -0.7>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Critical damage won't go lower than normal damage anymore.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_CriticalDamage');
	var paramBaseMultiplier = Number(parameters['Base Multiplier'] || 2.0);

	Game_Enemy.prototype.critMultiplier = function() {
		var multiplier = this.enemy().meta.CritMultiplier ? 0.0 : paramBaseMultiplier;
		var traitObjects = this.traitObjects();
		for (var i = 0; i < traitObjects.length; i++) {
			if (traitObjects[i].meta.CritMultiplier)
				multiplier += Number(traitObjects[i].meta.CritMultiplier);
		}
		return multiplier;
	};

	Game_Actor.prototype.critMultiplier = function() {
		var multiplier = 0.0;
		if (this.currentClass().meta.CritMultiplier)
			multiplier = Number(this.currentClass().meta.CritMultiplier);
		else if (this.actor().meta.CritMultiplier)
			multiplier = Number(this.actor().meta.CritMultiplier);
		else 
			multiplier = paramBaseMultiplier;

		var traitObjects = this.traitObjects();
		for (var i = 0; i < traitObjects.length; i++) {
			if ( traitObjects[i].classId	||
				 traitObjects[i].expParams	||
				!traitObjects[i].meta.CritMultiplier) continue;

			multiplier += Number(traitObjects[i].meta.CritMultiplier);
		}
		return multiplier;
	};

	Game_Action.prototype.applyCritical = function(damage) {
		return damage * Math.max(1.0, this.subject().critMultiplier());
	};
})();
