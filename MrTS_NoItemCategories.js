//=============================================================================
// MrTS_NoItemCategories.js
//=============================================================================

/*:
* @plugindesc Removes item categories from item menu scene and from shop scene.
* @author Mr. Trivel
*
* @param Hide Menu
* @desc Hide item categories in menu scene? True/False
* Default: True
* @default True
*
* @param Hide Shop
* @desc Hide item categories in shop scene? True/False
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
* Version 1.1
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.1 - Removed item categories from shop scene.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_NoItemCategories');
	var paramHideMenu = (parameters['Hide Menu'] || "True").toLowerCase() === "true";
	var paramHideShop = (parameters['Hide Shop'] || "True").toLowerCase() === "true";

	// Categories
	var _Window_ItemList_includes = Window_ItemList.prototype.includes;
	Window_ItemList.prototype.includes = function(item) {
		if (this._category == 'all')
			return true;
		else
			return _Window_ItemList_includes.call(this, item);
	};

	// Scene_Item
	if (paramHideMenu)
	{
		
		Scene_Item.prototype.createCategoryWindow = function() {
		};

		Scene_Item.prototype.createItemWindow = function() {
		    var wy = this._helpWindow.height;
		    var wh = Graphics.boxHeight - wy;
		    this._itemWindow = new Window_ItemList(0, wy, Graphics.boxWidth, wh);
		    this._itemWindow.setHelpWindow(this._helpWindow);
		    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
		    this._itemWindow.setHandler('cancel', this.popScene.bind(this));
		    this._itemWindow.setCategory('all');
		    this.addWindow(this._itemWindow);
		    this._itemWindow.activate();
		    this._itemWindow.select(0);
		};
	}

	// Scene_Shop
	if (paramHideShop)
	{
		var _Scene_Shop_createCategoryWindow = Scene_Shop.prototype.createCategoryWindow;
		Scene_Shop.prototype.createCategoryWindow = function() {
			_Scene_Shop_createCategoryWindow.call(this);
			this._categoryWindow.y = -1000;
		};

		Scene_Shop.prototype.createSellWindow = function() {
		    var wy = this._dummyWindow.y;
		    var wh = Graphics.boxHeight - wy;
		    this._sellWindow = new Window_ShopSell(0, wy, Graphics.boxWidth, wh);
		    this._sellWindow.setHelpWindow(this._helpWindow);
		    this._sellWindow.hide();
		    this._sellWindow.setHandler('ok',     this.onSellOk.bind(this));
		    this._sellWindow.setHandler('cancel', this.onCategoryCancel.bind(this));
		    this._sellWindow.setCategory('all');
		    this.addWindow(this._sellWindow);
		};

		var _Scene_Shop_commandSell = Scene_Shop.prototype.commandSell;
		Scene_Shop.prototype.commandSell = function() {
			_Scene_Shop_commandSell.call(this);
			this._categoryWindow.deactivate();
		    this._sellWindow.activate();
		    this._sellWindow.select(0);
		};
	}

})();
