//=============================================================================
// MrTS_DamageEfficiency.js
//=============================================================================

/*:
* @plugindesc Adds notetags that allow battlers to deal more damage with skills depending on their efficiency.
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
* Trait Object Note Tags (Actor, Class, Enemy, State, Armor, Weapon)
* --------------------------------------------------------------------------------
* <WeaponEfficiency: [WEAPON_TYPE_ID], [PERCENT]>
* <ElementEfficiency: [ELEMENT_ID], [PERCENT]>
* <SkillTypeEfficiency: [SKILL_TYPE_ID], [PERCENT]>
* <OverallEfficiency: [PERCENT]>
* [PERCENT]: 0.01 - 1%, 0.5 - 50%, -0.25 - -25%
* 
* Weapon Efficiency - battlers deal more damage while wielding that weapon type.
* Element Efficiency - battlers deal more damage with skills of that element.
* Skill Type Efficiency - battlers deal more damage with skills of that type.
* Overall Efficiency - battlers just deal more damage
*
* Examples:
* <WeaponEfficiency: 2, 0.5>
* <ElementEfficiency: 2, 1.0>
* <SkillTypeEfficiency: 1, -0.5>
* <OverallEfficiency: 2.0>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Skill/Item Note Tags
* --------------------------------------------------------------------------------
* By default all skills are affected by efficiency. For some skill/item to ignore
*  effiency bonus use the following note tags:
* <IgnoreWeaponBonus: [WEAPON_TYPE_ID], [WEAPON_TYPE_ID], ..., [WEAPON_TYPE_ID]>
* <IgnoreElementBonus>
* <IgnoreSkillTypeBonus>
* <IgnoreOverallBonus>
* <IgnoreAllBonuses>
*
* Examples:
* <IgnoreWeaponBonus: 1, 2, 3, 4, 5>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	Game_BattlerBase.prototype.getWeaponEfficiency = function(id) {
		var to = this.traitObjects();
		var eff = 0.0;
		for (var i = 0; i < to.length; i++) {
			if (to[i].meta.WeaponEfficiency) {
				var val = to[i].meta.WeaponEfficiency.split(',');
				if (Number(val[0]) === id) {
					eff += Number(val[1]);
				}
			}
		}
		return eff;
	};

	Game_BattlerBase.prototype.getElementEfficiency = function(id) {
		var to = this.traitObjects();
		var eff = 0.0;
		for (var i = 0; i < to.length; i++) {
			if (to[i].meta.ElementEfficiency) {
				var val = to[i].meta.ElementEfficiency.split(',');
				if (Number(val[0]) === id) {
					eff += Number(val[1]);
				}
			}
		}
		return eff;
	};

	Game_BattlerBase.prototype.getSkillTypeEfficiency = function(id) {
		var to = this.traitObjects();
		var eff = 0.0;
		for (var i = 0; i < to.length; i++) {
			if (to[i].meta.SkillTypeEfficiency) {
				var val = to[i].meta.SkillTypeEfficiency.split(',');
				if (Number(val[0]) === id) {
					eff += Number(val[1]);
				}
			}
		}
		return eff;
	};

	Game_BattlerBase.prototype.getOverallEfficiency = function() {
		var to = this.traitObjects();
		var eff = 0.0;
		for (var i = 0; i < to.length; i++) {
			if (to[i].meta.OverallEfficiency) {
				eff += Number(to[i].meta.OverallEfficiency);
			}
		}
		return eff;
	};

	var _Game_Action_applyVariance = Game_Action.prototype.applyVariance;
	Game_Action.prototype.applyVariance = function(damage, variance) {
		var value = damage;

		var item = this.item();
		var a = this.subject();

		if (!item.meta.IgnoreAllBonuses)
		{
			var ignoreWeaponBonus = false;
			if (item.meta.IgnoreWeaponBonus && a.isActor()) {
				var arr = item.meta.IgnoreWeaponBonus.split(',');
				for (var i = 0; i < arr.length; i++) {
					if (a.weapons()[0] && a.weapons()[0].wtypeId === Number(arr[i])) {
						ignoreWeaponBonus = true;
						break;
					}
				}
			}

			if (!ignoreWeaponBonus && a.isActor() && a.weapons()[0]) {
				var wb = 1 + a.getWeaponEfficiency(a.weapons()[0].wtypeId);
				if (wb < 0) wb = 0;
				value *= wb;
			}

			if (!item.meta.IgnoreElementBonus) {
				var eb = 1 + a.getElementEfficiency(item.damage.elementId);
				if (eb < 0) eb = 0;
				value *= eb;
			}

			if (!item.meta.IgnoreSkillTypeBonus && item.stypeId) {
				var stb = 1 + a.getSkillTypeEfficiency(item.stypeId);
				if (stb < 0) stb = 0;
				value *= stb;
			}

			if (!item.meta.IgnoreOverallBonus) {
				var ob = 1 + a.getOverallEfficiency();
				if (ob < 0) ob = 0;
				value *= ob;
			}
		}

		return _Game_Action_applyVariance.call(this, value, variance);
	};
})();
