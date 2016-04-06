//=============================================================================
// MrTS_HPMPTPMulticolorGauges.js
//=============================================================================
//
var Imported = Imported || {};
Imported.MrTS_HPMPTPMulticolorGauges = true;

/*:
* @plugindesc Allows to set more than starting/ending color for HP/MP/TP gauges.
* @author Mr. Trivel
*
* @param Use HP Gauge
* @desc Use multicolored HP Gauge? True/False
* Default: True
* @default True
*
* @param Use MP Gauge
* @desc Use multicolored MP Gauge? True/False
* Default: True
* @default True
*
* @param Use TP Gauge
* @desc Use multicolored TP Gauge? True/False
* Default: True
* @default True
* 
* @param HP Gauge
* @desc Colors for HP gauge. Any amount. In Hex.
* Default: #ff0000 #f1913c #dffc1d #3bbd48 #1f8304
* @default #ff0000 #f1913c #dffc1d #3bbd48 #1f8304
* 
* @param MP Gauge
* @desc Colors for MP gauge. Any amount. In Hex
* Default: #f19aea #dab5eb #7f85fe #3800a9 #021456
* @default #f19aea #dab5eb #7f85fe #3800a9 #021456
*
* @param TP Gauge
* @desc Colors for TP gauge. Any amount. In Hex.
* Default: #ffffff #bababa #7a7a7a #393939 #000000
* @default #ffffff #bababa #7a7a7a #393939 #000000
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Version 1.2
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.2 - Compatibility with MrTS_DifferentMPColorsAndNames
*     - Crash fix with MP/TP bars
* 1.1 - Crash fix, disabling multicolor bars from plugin parameters added.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_HPMPTPMulticolorGauges');
	var paramHPGauge = String(parameters['HP Gauge'] || "#ff0000 #f1913c #dffc1d #3bbd48 #1f8304");
	var paramMPGauge = String(parameters['MP Gauge'] || "#f19aea #dab5eb #7f85fe #3800a9 #021456");
	var paramTPGauge = String(parameters['TP Gauge'] || "#ffffff #bababa #7a7a7a #393939 #000000");
	var paramUseHP = (parameters['Use HP Gauge'] || "True").toLowerCase() === "true";
	var paramUseMP = (parameters['Use MP Gauge'] || "True").toLowerCase() === "true";
	var paramUseTP = (parameters['Use TP Gauge'] || "True").toLowerCase() === "true";

	var parArrHP = paramHPGauge.split(' ');
	var parArrMP = paramMPGauge.split(' ');
	var parArrTP = paramTPGauge.split(' ');

	var _WindowBase_drawActorHp = Window_Base.prototype.drawActorHp;
	Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
		var hpColorArray = parArrHP;
		if (Imported.MrTS_DifferentHpMpTpColorsAndNames)
		{
			this.setHpGaugeColors(actor.actorId());
			hpColorArray = this._hpGaugeColors;
		}
		 
		if (hpColorArray.length > 0 && paramUseHP)
		{
			width = width || 186;
			var offset = Math.floor(width/(hpColorArray.length-1));
			for (var i = 0; i < hpColorArray.length-1; i++) {
				var color1 = hpColorArray[i];
				var color2 = hpColorArray[i+1];
				this.drawGauge(x + offset*i - (i !== 0 && i !== hpColorArray.length-1 ? 1 : 0), y, offset + (i !== 0 && i !== hpColorArray.length-1 ? 1 : 0), 1.00, color1, color2);
			}
			var rate = 1.00 - actor.hpRate();
			var amount = width * rate;
			var height = Imported.YEP_CoreEngine ? this.gaugeHeight() : 8;
			var yPos = Imported.YEP_CoreEngine ? y + this.lineHeight() - height - 2 : Math.floor(y + this.lineHeight() - 8);
			this.contents.fillRect(x+width-amount, yPos, amount, height, this.gaugeBackColor());
			this.changeTextColor(this.systemColor());
			this.drawText(TextManager.hpA, x, y, 44);
			this.drawCurrentAndMax(actor.hp, actor.mhp, x, y, width,
								   this.hpColor(actor), this.normalColor());
		}
		else
			_WindowBase_drawActorHp.call(this, actor, x, y, width);
	};

	var _WindowBase_drawActorMp = Window_Base.prototype.drawActorMp;
	Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
		var mpColorArray = parArrMP;
		if (Imported.MrTS_DifferentHpMpTpColorsAndNames)
		{
			this.setMpGaugeColors(actor.actorId());
			mpColorArray = this._mpGaugeColors;
		}

		if (mpColorArray.length > 0 && paramUseMP)
		{
			width = width || 186;
			var offset = Math.floor(width/(mpColorArray.length-1));
			for (var i = 0; i < mpColorArray.length-1; i++) {
				var color1 = mpColorArray[i];
				var color2 = mpColorArray[i+1];
				this.drawGauge(x + offset*i - (i !== 0 && i !== mpColorArray.length-1 ? 1 : 0), y, offset + (i !== 0 && i !== mpColorArray.length-1 ? 1 : 0), 1.00, color1, color2);
			}
			var rate = 1.00 - actor.mpRate();
			var amount = width * rate;
			var height = Imported.YEP_CoreEngine ? this.gaugeHeight() : 8;
			var yPos = Imported.YEP_CoreEngine ? y + this.lineHeight() - height - 2 : y + this.lineHeight() - 9;
			this.contents.fillRect(x+width-amount, yPos, amount, height, this.gaugeBackColor());
			this.changeTextColor(this.systemColor());
			this.drawText(TextManager.mpA, x, y, 44);
			this.drawCurrentAndMax(actor.mp, actor.mmp, x, y, width,
								   this.mpColor(actor), this.normalColor());
		}
		else
			_WindowBase_drawActorMp.call(this, actor, x, y, width);
	};

	var _WindowBase_drawActorTp = Window_Base.prototype.drawActorTp;
	Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
		var tpColorArray = parArrTP;
		if (Imported.MrTS_DifferentHpMpTpColorsAndNames)
		{
			this.setTpGaugeColors(actor.actorId());
			tpColorArray = this._tpGaugeColors;
		}

		if (tpColorArray.length > 0 && paramUseTP)
		{
			width = width || 186;
			var offset = Math.floor(width/(tpColorArray.length-1));

			for (var i = 0; i < tpColorArray.length-1; i++) {
				var color1 = tpColorArray[i];
				var color2 = tpColorArray[i+1];
				this.drawGauge(x + offset*i - (i !== 0 && i !== tpColorArray.length-1 ? 1 : 0), y, offset + (i !== 0 && i !== tpColorArray.length-1 ? 1 : 0), 1.00, color1, color2);
			}
			var rate = 1.00 - actor.tpRate();
			var amount = width * rate;
			var height = Imported.YEP_CoreEngine ? this.gaugeHeight() : 8;
			var yPos = Imported.YEP_CoreEngine ? y + this.lineHeight() - height - 2 : y + this.lineHeight() - 9;
			this.contents.fillRect(x+width-amount, yPos, amount, height, this.gaugeBackColor());
			this.changeTextColor(this.systemColor());
			this.drawText(TextManager.tpA, x, y, 44);
		    this.changeTextColor(this.tpColor(actor));
		    this.drawText(actor.tp, x + width - 64, y, 64, 'right');
		}
		else
			_WindowBase_drawActorTp.call(this, actor, x, y, width);
	};
})();
