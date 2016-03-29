//=============================================================================
// MrTS_HideQuantities.js
//=============================================================================

/*:
* @plugindesc Allows to hide item quantities of specific items.
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
* Item/Armor/Weapon Tag
* --------------------------------------------------------------------------------
* Add tag <noq> to note fields of items which should not display their quantity.
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var _Window_ItemList_drawItemNumber = Window_ItemList.prototype.drawItemNumber;
	Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
		if (item.meta.noq) return;
		_Window_ItemList_drawItemNumber.call(this, item, x, y, width);
	};
})();
