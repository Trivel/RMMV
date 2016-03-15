//=============================================================================
// MrTS_ChangeEquipmentOnLevelUp.js
//=============================================================================

/*:
* @plugindesc Changes actor's equipment on specific levels when leveling up.
* @author Mr. Trivel
*
* @param Destroy
* @desc Destroy previous item on level up? True/False
* Default: True
* @default True
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
* How to set up
* --------------------------------------------------------------------------------
* Open the plugin in your favorite text editor, scroll down to EQUIPMENT SETUP
* and follow the structure there.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_ChangeEquipmentOnLevelUp');
	var paramDestroy = (parameters['Destroy'] || "True").toLowerCase() === "true";

	/* --------------------------------------------------------------------------------
	 * -------- EQUIPMENT SETUP HERE v
	 * -------------------------------------------------------------------------------- */
	 /* --------------------------------------------------------------------------------
	 * --- Structure is as follows:
	 * Actor ID : {
	 * 		LEVEL: [[Equipment Type, id, slot], [itemType, id, slot]...]
	 * }
	 *
	 * Equipment type: 'w' - weapon, 'a' - armor
	 * Examples below
	 * -------------------------------------------------------------------------------- */

	 var equipmentSetup = {
	 	1: {
	 		5: [['w', 5, 0], ['a', 5, 2]],
	 		10: [['w', 6, 0]],
	 		16: [['a', 6, 3]]
	 	},

	 	4: {
	 		5: [['a', 6, 3]]
	 	}
	 };
	 /* --------------------------------------------------------------------------------
	 * -------- EQUIPMENT SETUP THERE ^
	 * -------------------------------------------------------------------------------- */

	var _GameActor_levelUp = Game_Actor.prototype.levelUp;
	Game_Actor.prototype.levelUp = function() {
		_GameActor_levelUp.call(this);
		if (equipmentSetup[this._actorId] && equipmentSetup[this._actorId][this._level])
		{
			var list = equipmentSetup[this._actorId][this._level];
			for (var i = 0; i < list.length; i++) {
				var item = null;
				switch(list[i][0])
				{
					case 'a':
					{
						item = $dataArmors[list[i][1]];
					} break;
					case 'w':
					{
						item = $dataWeapons[list[i][1]];
					} break;
				}
				if (item)
				{
					if (!paramDestroy) this.changeEquip(list[i][2], null);
					this.forceChangeEquip(list[i][2], item);
				}
			}
		}
	};
})();
