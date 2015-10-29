//==============================================================================
// MrTS_NoItemCategories.js
//==============================================================================

/*:
* @plugindesc Removes item categories.
* @author Mr. Trivel
* 
* @help Version 1.0
* Free for commercial and non-commercial use as long as credit is given.
*/

(function() {

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

	var _Window_ItemList_includes = Window_ItemList.prototype.includes;
	Window_ItemList.prototype.includes = function(item) {
		if (this._category == 'all')
			return true;
		else
			_Window_ItemList_includes.call(this);
	};

})();
