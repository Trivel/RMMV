//=============================================================================
// MrTS_SetCharacterFrame.js
//=============================================================================

/*:
* @plugindesc Adds extra method to Game_CharacterBase: setCharacterFrame(index)
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
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
	Game_CharacterBase.prototype.initMembers = function() {
		_Game_CharacterBase_initMembers.call(this);
		this._frame = 0;
	};

	Game_CharacterBase.prototype.setCharacterFrame = function(index) {
		var pattern = index % 3;
		var dir = ((index - pattern) / 3 + 1) * 2;
		this._frame = index;
		this._pattern = pattern;
		this._direction = dir;
	};
})();
