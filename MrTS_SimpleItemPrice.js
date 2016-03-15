//=============================================================================
// MrTS_SimpleItemPrice.js
//=============================================================================

/*:
* @plugindesc Allows to set default sell price in note tags.
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
* Item/Weapon/Armor Tags
* --------------------------------------------------------------------------------
* <SellPrice: [PRICE]>
* [PRICE] - default sell price.
*
* E.g.:
* <SellPrice: 9999>
* <SellPrice: 2000>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var _SceneShop_sellingPrice = Scene_Shop.prototype.sellingPrice;
	Scene_Shop.prototype.sellingPrice = function() {
		if (this._item.meta.SellPrice)
			return Number(this._item.meta.SellPrice)
		else
			return _SceneShop_sellingPrice.call(this);
	};
})();
