//=============================================================================
// MrTS_PercentEquipmentStats.js
//=============================================================================

/*:
* @plugindesc Allows for items to have percentage stat increases.
* @author Mr. Trivel
*
* @param Stacking
* @desc How will percent stats stack? Additive or Multiplicative?
* Default: Additive
* @default Additive
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
* Weapon/Armor Note Tags
* --------------------------------------------------------------------------------
* Following tags influence stats item give when put into weapon or armor notefield
* <mhp: [TYPE] [VALUE]>
* <mmp: [TYPE] [VALUE]>
* <atk: [TYPE] [VALUE]>
* <def: [TYPE] [VALUE]>
* <matk: [TYPE] [VALUE]>
* <mdef: [TYPE] [VALUE]>
* <agi: [TYPE] [VALUE]>
* <luk: [TYPE] [VALUE]>
*
* [TYPE] - p, v
* p - percentage, [VALUE] - 1, -0.2, 0.505 |1 - +100%, -0.2 - -20%, 0.505 - +50.5%
* v - variable, [VALUE] - 1, 5, 10
*
* How to set decimals in variables?
* Simply choose Script in Operand in Control Variables and you can type 1.0 there.
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_PercentEquipmentStats');
	var paramStacking = String(parameters['Stacking'] || "Additive").toLowerCase();

	var _GameActor_paramPlus = Game_Actor.prototype.paramPlus;
	Game_Actor.prototype.paramPlus = function(paramId) {
		var params = ["mhp", "mmp", "atk", "def", "matk", "mdef", "agi", "luk"];
		var value = _GameActor_paramPlus.call(this, paramId);
		var equips = this.equips();
		var multiplier = 0.0;
	    for (var i = 0; i < equips.length; i++) {
	        var item = equips[i];
	        if (item && item.meta[params[paramId]]) {
	        	var meta = item.meta[params[paramId]];
	        	if (meta[0] === " ") meta = meta.substring(1);
	        	meta = meta.split(' ');
	        	switch (meta[0])
	        	{
	        		case "p":
	        		{
	        			if (paramStacking === "additive")
	        				multiplier += Number(meta[1]);
	        			else
	        			{
	        				var add = this.getMultipliedValue(Number(meta[1]), this.paramBase(paramId), value);
	        				value += add;
	        			}       			
	        		} break;
	        		case "v":
	        		{
	        			if (paramStacking === "additive")
	        				multiplier += $gameVariables.value(Number(meta[1]));
	        			else
	        			{
		        			var add = this.getMultipliedValue($gameVariables.value(Number(meta[1])), this.paramBase(paramId), value);
		        			value += add;
	        			}
	        		} break;
	        	}
	        }
	    }
        value += this.getMultipliedValue(multiplier, this.paramBase(paramId), value);
	    return value;
	};

	Game_Actor.prototype.getMultipliedValue = function(mult, base, plus) {
		return Math.round((base + plus) * mult);
	};
})();
