//=============================================================================
// MrTS_SimpleShopTax.js
//=============================================================================

/*:
* @plugindesc Allows easy way to change prices for whole shop items at once.
* @author Mr. Trivel
* 
* @help 
* --------------------------------------------------------------------------------
* Free for non commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
** 
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* 	SetTaxTo [TAX]
* E.g.: SetTaxTo 100
* That would set tax to 100% of original price. So the item cost would be double.
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
		if (command === 'SetTaxTo') {
			$gameSystem.setTaxTo(Number(args[0]));
		}
	};

	//--------------------------------------------------------------------------
	// Window_ShopBuy
	// 
	
	var _WindowShopBuy_price = Window_ShopBuy.prototype.price;
	Window_ShopBuy.prototype.price = function(item) {
		var price = _WindowShopBuy_price.call(this, item);
		price += Math.floor(price * $gameSystem.getTax());
	    return price;
	};

	//--------------------------------------------------------------------------
	// Game_System
	// 

	Game_System.prototype.setTaxTo = function(tax) {
		this._shopTax = tax;
	};

	Game_System.prototype.getTax = function() {
		return this._shopTax/100 || 0;
	};
})();
