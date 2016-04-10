//=============================================================================
// MrTS_CommonEventDebug.js
//=============================================================================

/*:
* @plugindesc Logs all executing common events to console.
* @author Mr. Trivel
*
* @param Console
* @desc Show debug in console?
* Default: True
* @default True
*
* @param Window
* @desc Show debug in game window?
* Default: True
* @default True
*
* @param Window Frames
* @desc If showing in game window, how many frames will it last?
* Default: 80
* @default 80
*
* @param Notification Height
* @desc How tall is the notification?
* Default: 40
* @default 40
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
* Open console by pressing F8.
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.2 - Added plugin parameter to change height of notification.
* 1.1 - Added Common Event notifications in window.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_CommonEventDebug');
	var paramConsole = Boolean((parameters['Console'] || "true").toLowerCase() === "true");
	var paramWindow = Boolean((parameters['Window'] || "true").toLowerCase() === "true");
	var paramWindowFrames = Number(parameters['Window Frames'] || 80);
	var paramNotificationHeight = Number(parameters['Notification Height'] || 40);

	var _GameInterpreter_setupChild = Game_Interpreter.prototype.setupChild;
	Game_Interpreter.prototype.setupChild = function(list, eventId) {
		_GameInterpreter_setupChild.call(this, list, eventId);
	    if (paramConsole) 
	    	console.log((eventId === 0 ? "Battle" : "EventID: " + eventId)  + " executed CE ID #" + this._params[0] + " - " + $dataCommonEvents[this._params[0]].name);
	    if (paramWindow)
	    	$gameTemp.addToEventDebugQueue(this._params[0]);
	};

	var _GameAction_applyGlobal = Game_Action.prototype.applyGlobal;
	Game_Action.prototype.applyGlobal = function() {
	    this.item().effects.forEach(function(effect) {
	        if (effect.code === Game_Action.EFFECT_COMMON_EVENT) {
	        	if (paramConsole) console.log("ItemID: " + this.item().id + " executed CE ID #" + effect.dataId + " - " + $dataCommonEvents[effect.dataId].name);
	        	if (paramWindow) $gameTemp.addToEventDebugQueue(effect.dataId);
	        }
	    }, this);
		_GameAction_applyGlobal.call(this);
	};

	if (paramWindow)
	{
		var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
		Scene_Map.prototype.createDisplayObjects = function() {
			_Scene_Map_createDisplayObjects.call(this);
			this.createEventDebugQueue();
		};

		var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
		Scene_Battle.prototype.createDisplayObjects = function() {
			_Scene_Battle_createDisplayObjects.call(this);
			this.createEventDebugQueue();
		};

		Scene_Base.prototype.createEventDebugQueue = function() {
			this._eventDebugQueue = [];
		};

		var _Scene_Map_updateScene = Scene_Map.prototype.updateScene;
		Scene_Map.prototype.updateScene = function() {
			_Scene_Map_updateScene.call(this);
			if (!SceneManager.isSceneChanging())
				this.updateEventDebugQueue();
		};

		var _Scene_Battle_updateWindowPositions = Scene_Battle.prototype.updateWindowPositions;
		Scene_Battle.prototype.updateWindowPositions = function() {
			_Scene_Battle_updateWindowPositions.call(this);
			this.updateEventDebugQueue();
		};

		Scene_Base.prototype.updateEventDebugQueue = function() {
			var queue = $gameTemp.getEventDebugQueue();
			if (queue.length > 0)
			{
				for (var i = 0; i < queue.length; i++) {
					var ce = queue[i];
					var name = $dataCommonEvents[ce].name;
					var sprite = new Sprite();
					var bitmap = new Bitmap(1, 1);
					bitmap.fontSize = paramNotificationHeight - 4;
					var txt = "#" + ce + " " + name;
					var tw = Math.ceil(bitmap.measureTextWidth(txt));
					bitmap.resize(tw + 4, paramNotificationHeight);
					sprite.bitmap = bitmap;
					bitmap.fillAll("#282828");
					bitmap.drawText(txt, 2, 0, bitmap.width-4, paramNotificationHeight, 'left');
					sprite.x = -sprite.width;
					sprite.y = this._eventDebugQueue.length*paramNotificationHeight;
					this.addChild(sprite);
					var obj = {
						timer: paramWindowFrames, 
						image: sprite, 
						xGoal: 0, 
						yGoal: sprite.y,
						floatX: sprite.x,
						floatY: sprite.y,
						state: 'right'
					};
					this._eventDebugQueue.push(obj);
				}
				$gameTemp.removeFromEventDebugQueue();
			}
			if (this._eventDebugQueue.length > 0)
			{
				for (var i = this._eventDebugQueue.length - 1; i >= 0; i--) {
					var ced = this._eventDebugQueue[i];
					switch(ced.state)
					{
						case 'left':
						{
							var dtX = ced.xGoal - ced.floatX;
							ced.floatX += dtX * 0.08;
							ced.image.x = Math.floor(ced.floatX);
							if (Math.abs(ced.xGoal - ced.floatX) < 1) ced.floatX = ced.xGoal;
						} break;
						case 'right':
						{
							var dtX = ced.xGoal - ced.floatX;
							ced.floatX += dtX * 0.05;
							ced.image.x = Math.floor(ced.floatX);
							if (Math.abs(ced.xGoal - ced.floatX) < 1) {
								ced.floatX = ced.xGoal;
								ced.state = 'timer';
							} 
						} break;
						case 'timer':
						{
							ced.timer--;
							if (ced.timer <= 0) {
								ced.state = 'left';
								ced.xGoal = -ced.image.width;	
							} 
						} break;						
					}
					ced.yGoal = this._eventDebugQueue.indexOf(ced) * paramNotificationHeight;
					var dtY = ced.yGoal - ced.floatY;
					ced.floatY += dtY * 0.05;
					ced.image.y = Math.floor(ced.floatY);
					if (Math.abs(ced.yGoal - ced.floatY) < 1) ced.floatY = ced.yGoal;
					if (ced.floatX === ced.xGoal && ced.state === 'left')
					{
						this.removeChild(ced.image);
						this._eventDebugQueue.splice(i, 1);
					}
				}
			}
		};

		Game_Temp.prototype.addToEventDebugQueue = function(ceId) {
			if (!this._eventDebugQueue) this._eventDebugQueue = [];
			this._eventDebugQueue.push(ceId);
		};

		Game_Temp.prototype.removeFromEventDebugQueue = function() {
			this._eventDebugQueue = [];
		};

		Game_Temp.prototype.getEventDebugQueue = function() {
			if (!this._eventDebugQueue) this._eventDebugQueue = [];
			return this._eventDebugQueue;
		};
	}
})();
