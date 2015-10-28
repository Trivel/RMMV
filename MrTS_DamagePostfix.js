//==============================================================================
// MrTS_DamagePostfix.js
//==============================================================================

/*:
* @plugindesc Adds postfixes to damage dealt.
* @author Mr. Trivel
* 
* @param Show B
* @desc When should B postfix be shown.
* @default 1000000000
*
* @param Show M
* @desc When should B postfix be shown.
* @default 1000000
*
* @param Show K
* @desc When should B postfix be shown.
* @default 1000
*
* @param Decimal Points
* @desc How many decimal points should be used
* @default 2
* 
* @help Version 1.0
* B should be the highest, followed by M and K.
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_DamagePostfix');

	var showB = Number(parameters['Show B'] || 1000000000);
	var showM = Number(parameters['Show M'] || 1000000);
	var showK = Number(parameters['Show K'] || 1000);
	var decimalPoints = Number(parameters['Decimal Points'] || 2);

	Sprite_Damage.prototype.digitHeight = function() {
	    return this._damageBitmap ? this._damageBitmap.height / 6 : 0;
	};

	Sprite_Damage.prototype.createDigits = function(baseRow, value) {
	    var string = Math.abs(value).toString();

	    var abs = Math.abs(value);
	    if (value > showB)
	    {
	        abs = (abs/showB).toFixed(decimalPoints);
	        string = abs.toString() + "B";
	    }
	    else if (value > showM)
	    {
	        abs = (abs/showM).toFixed(decimalPoints);
	        string = abs.toString() + "M";
	    }
	    else if (value > showK)
	    {
	        abs = (abs/showK).toFixed(decimalPoints);
	        string = abs.toString() + "K";
	    }

	    var row = baseRow + (value < 0 ? 1 : 0);
	    var w = this.digitWidth();
	    var h = this.digitHeight();
	    var d = false;
	    var l = false;
	    for (var i = 0; i < string.length; i++) {
	        var sprite = this.createChildSprite();
	        switch(string[i]){
	            case "K":
	                sprite.setFrame(0, 5*h, 32, h);
	                l = true;
	                break;

	            case "M":
	                sprite.setFrame(32, 5*h, 32, h);
	                l = true;
	                break;

	            case "B":
	                sprite.setFrame(64, 5*h, 32, h);
	                l = true;
	                break;

	            case ".":
	                sprite.setFrame(96, 5*h, 32, h);
	                break;

	            default:
	                var n = Number(string[i]);
	                sprite.setFrame(n * w, row * h, w, h);
	                break;
	        }

	        sprite.x = (i - (string.length - 1) / 2) * w - (d ? 18 : 0) + (l ? 4 : 0);
	        if (string[i] === ".") d = true;
	        sprite.dy = -i;
	    }
	};

})();
