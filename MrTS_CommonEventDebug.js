//=============================================================================
// MrTS_CommonEventDebug.js
//=============================================================================

/*:
* @plugindesc Prints all executing common events to console.
* @author Mr. Trivel
*
* @param On
* @desc Default: true
* @default true
* 
* @help 
* --------------------------------------------------------------------------------
* Free for commercial and non-commercial use.
* Version 1.0
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Open console by pressing F8.
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_CommonEventDebug');
	var paramOn = Boolean((parameters['On'] || "true").toLowerCase() === "true");

	var _GameInterpreter_setupChild = Game_Interpreter.prototype.setupChild;
	Game_Interpreter.prototype.setupChild = function(list, eventId) {
		_GameInterpreter_setupChild.call(this, list, eventId);
	    if (paramOn) console.log((eventId === 0 ? "Battle" : "EventID: " + eventId)  + " executed CE ID #" + this._params[0]);
	};

	var _GameAction_applyGlobal = Game_Action.prototype.applyGlobal;
	Game_Action.prototype.applyGlobal = function() {
	    this.item().effects.forEach(function(effect) {
	        if (effect.code === Game_Action.EFFECT_COMMON_EVENT) {
	        	if (paramOn) console.log("ItemID: " + this.item().id + " executed CE ID #" + effect.dataId);
	        }
	    }, this);
		_GameAction_applyGlobal.call(this);
	};
})();
