//=============================================================================
// MrTS_CurrencyName.js
//=============================================================================

/*:
* @plugindesc Allows to change how currency is called midgame.
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
* Plugin Commands
* --------------------------------------------------------------------------------
* SetCurrency [NAME] - sets currency to [NAME]
* Example:
* SetCurrency Glasses
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 
	
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "setcurrency") {
			$gameSystem.setCurrencyUnit(args[0]);
		}
	};

	Object.defineProperty(TextManager, 'currencyUnit', {
	    get: function() { return $gameSystem.getCurrencyUnit(); },
	    configurable: true
	});

	Game_System.prototype.getCurrencyUnit = function() {
		if (!this._currencyUnit) return $dataSystem.currencyUnit;
		return this._currencyUnit;
	};

	Game_System.prototype.setCurrencyUnit = function(currency) {
		this._currencyUnit = currency;
	};
})();
