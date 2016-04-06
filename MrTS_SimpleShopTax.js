//=============================================================================
// MrTS_SimpleShopTax.js
//=============================================================================

/*:
* @plugindesc Allows easy way to change prices for whole shop items at once.
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
* Version 1.1
* --------------------------------------------------------------------------------
** 
* --------------------------------------------------------------------------------
* Plugin Commands
* --------------------------------------------------------------------------------
* SetTaxTo Buy [TAX]
* SetTaxTo Sell [TAX]
* 
* Examples:
* SetTaxTo Buy 50
* SetTaxTo Buy -75
* SetTaxTo Sell 25
* SeTtAxTo Sell -50
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Added sell tax.
* 1.0 - Release
*/

(function() {

	//--------------------------------------------------------------------------
	// Game_Interpreter
	// 

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === 'settaxto') {
			switch(args[0].toUpperCase())
			{
				case 'BUY':
				{
					$gameSystem.setBuyTaxTo(Number(args[1]));
				} break;
				case 'SELL':
				{
					$gameSystem.setSellTaxTo(Number(args[1]));
				}	
			}
		}
	};

	//--------------------------------------------------------------------------
	// Window_ShopBuy
	// 
	
	var _WindowShopBuy_price = Window_ShopBuy.prototype.price;
	Window_ShopBuy.prototype.price = function(item) {
		var price = _WindowShopBuy_price.call(this, item);
		price += Math.floor(price * $gameSystem.getBuyTax());
	    return price;
	};

	//--------------------------------------------------------------------------
	// Scene_Shop
	// 

	var _Scene_Shop_sellingPrice = Scene_Shop.prototype.sellingPrice;
	Scene_Shop.prototype.sellingPrice = function() {
		var sellingPrice = _Scene_Shop_sellingPrice.call(this);
	    return Math.max(0, sellingPrice - Math.floor(sellingPrice * $gameSystem.getSellTax()));
	};

	//--------------------------------------------------------------------------
	// Game_System
	// 

	Game_System.prototype.setBuyTaxTo = function(tax) {
		this._shopBuyTax = tax;
	};

	Game_System.prototype.setSellTaxTo = function(tax) {
		this._shopSellTax = tax;
	};

	Game_System.prototype.getBuyTax = function() {
		return this._shopBuyTax/100 || 0;
	};

	Game_System.prototype.getSellTax = function() {
		return this._shopSellTax/100 || 0;
	};
})();
