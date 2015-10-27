//==============================================================================
// MrTS_BattleCharacterLimit.js
//==============================================================================

/*:
* @plugindesc Adds color coding to items.
* @author Mr. Trivel
* 
* @param Max Characters
* @desc Max characters in battle
* @default 5
*
* @param Characters Per Row
* @desc Characters per row in battle
* @default 3
*
* @param Lower Index
* @desc How further each character below is
* @default 48
*
* @param Forward Offset
* @desc How forward should characters move per row
* @default 50
*
* @param Row Spacing
* @desc Space between rows
* @default 100
* 
* @help This plugin does not provide plugin commands.
* Version 1.0
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_BattleCharacterLimit');

	var maxCharacters = Number(parameters['Max Characters'] || 5);
	var charasPerRow = Number(parameters['Characters Per Row'] || 3);
	var lowerCharaIndex = Number(parameters['Lower Index'] || 48);
	var forwardIndex = Number(parameters['Forward Offset'] || 50);
	var rowSpacing = Number(parameters['Row Spacing'] || 100);

	Game_Party.prototype.maxBattleMembers = function() {
	    return maxCharacters;
	};

	Sprite_Actor.prototype.setActorHome = function(index) {
		var c = Math.floor(index/charasPerRow);
		var x = (600 - forwardIndex * Math.floor($gameParty.battleMembers().length/charasPerRow)) + lowerCharaIndex * (index % 3) + rowSpacing * c;
		var y = 280 + (index%charasPerRow) * 48;
	    this.setHome(x, y);
	};

})();
