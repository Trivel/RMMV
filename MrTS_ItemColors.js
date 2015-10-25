//==============================================================================
// MrTS_ItemColors.js
//==============================================================================

/*:
* @plugindesc Adds color coding to items.
* @author Mr. Trivel
* 
* @param Item Colors
* @desc HEX codes for item colors.
* @default #9d9d9d #FFFFFF #1eff00 #0070dd #a335ee #ff8000 #e6cc80
* 
* @help This plugin does not provide plugin commands.
* Version 1.0
*
* Use the following tag in Item note fields:
* <color: X> - X being index of color in the plugin Item Colors parameter.
* 
* E.g.
* <color: 1> - If using default settings, it'd be #9d9d9d color.
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_StaticExp');

	var itemColorsDefault = String(parameters['Item Colors'] || "#9d9d9d #FFFFFF #1eff00 #0070dd #a335ee #ff8000 #e6cc80")
	var itemColors = itemColorsDefault.split(" ");
	Window_Base.prototype.drawItemName = function(item, x, y, width) {
	    width = width || 312;
	    if (item) {
	        var iconBoxWidth = Window_Base._iconWidth + 4;

	        this.resetTextColor();
	        if (item.meta.color)
	        	this.changeTextColor(itemColors[item.meta.color-1]);
	        this.drawIcon(item.iconIndex, x + 2, y + 2);
	        this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
	    }
	};


})();
