//=============================================================================
// MrTS_SkillTimeReaction.js
//=============================================================================

/*:
* @plugindesc After using certain skills, there's a small window where 
* you can react to it. Doing so, improves skill in some way.
* @author Mr. Trivel
*
*
* @param Default Reaction Appearance
* @desc How long it takes for reaction window to appear? From To in frames.
* Default: 20 60
* @default 20 60
* 
* @param Default Reaction Time
* @desc How long the reaction window lasts? From To in frames.
* Default: 60 150
* @default 60 150
*
* @param Default State
* @desc If reaction succeeds which state to apply for the duration of attack?
* Default: 11
* @default 11
*
* @param Success SFX
* @desc Which SFX to play on success?
* Default: Skill2
* @default Skill2
*
* @param Fail SFX
* @desc Which SFX to play on failure?
* Default: Splash
* @default Splash
* 
* @help 
* --------------------------------------------------------------------------------
* Terms of Use
* --------------------------------------------------------------------------------
* Don't remove the header or claim that you wrote this plugin.
* Credit Mr. Trivel if using this plugin in your project.
* Free for commercial and non-commercial projects.
* --------------------------------------------------------------------------------
* Commissioned by Fisherolol
* --------------------------------------------------------------------------------
* Version 1.2
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* --------------------------------------------------------------------------------
* REQUIRES:
* Yanfly's Battle Engine Core
* --------------------------------------------------------------------------------
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Skill Tags
* --------------------------------------------------------------------------------
* Skill tags are placed in Skill Note fields.
* 
* When a skill has <Reaction> tag in it, it will display an image for a random
* amount of time in which player can 
* <Reaction>
* <ReactionAppear: [FROM] [TO]>
* <ReactionWindow: [FROM] [TO]>
* <ReactionState: [STATE ID]>
* [FROM] [TO] - How long the window lasts or appears. It'll pick a random number 
* of frames between [FROM] and [TO] ([FROM] <= time < [TO]).
* [STATE ID] - Which state to apply when hitting the button in react window.
*
* Only <Reaction> tag is a must to have the reaction window. Other tags like
* <ReactionAppear: [FROM] [TO]>, <ReactionWindow: [FROM] [TO]> or \
* <ReactionState: [STATE ID]> can be omitted to use default values from parameters.
* 
* Examples:
* <Reaction>
* <ReactionWindow: 50 100>
* <ReactionState: 15>
*
* <Reaction>
* <ReactionState: 50>
* <ReactionAppear: 40 100>
* --------------------------------------------------------------------------------
*
* --------------------------------------------------------------------------------
* Image Files
* --------------------------------------------------------------------------------
* This plugin displays an image to click.
* Images go to img\system.
*
* Image list:
* img\system\reactionWait.png
* img\system\reactionHit.png
* --------------------------------------------------------------------------------
* 
* --------------------------------------------------------------------------------
* Version History
* --------------------------------------------------------------------------------
* 1.2 - Fixed success and failure sound play overlap.
* 1.1 - SFX on success/failure. Fixed hit image not appearing when using default
*       values.
* 1.0 - Release
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_SkillTimeReaction');
	var paramDefaultReactAppear = String(parameters['Default Reaction Appearance'] || "20 60");
	var paramDefaultReactWindow = String(parameters['Default Reaction Time'] || "60 150");
	var paramDefaultStateId = Number(parameters['Default State'] || 11);
	var paramSuccessSfx = String(parameters['Success SFX'] || "Skill2");
	var paramFailSfx = String(parameters['Fail SFX'] || "Splash");

	var _SceneBattle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
	Scene_Battle.prototype.createDisplayObjects = function() {
		_SceneBattle_createDisplayObjects.call(this);
		this.createReactionVariables();
	};

	Scene_Battle.prototype.createReactionVariables = function() {
		this._successSfx = AudioManager.makeEmptyAudioObject();
		this._failSfx = AudioManager.makeEmptyAudioObject();
		this._successSfx.name = paramSuccessSfx;
		this._failSfx.name = paramFailSfx;
		this._successSfx.volume = 90;
		this._successSfx.pitch = 100;
		this._failSfx.volume = 90;
		this._failSfx.pitch = 100;
		AudioManager.loadStaticSe(this._successSfx);
		AudioManager.loadStaticSe(this._failSfx);
		this._reactionAppearTimer = 0;
		this._reactionWindowTimer = 0;
		this._reactionState = 0;
		this._reactionStatus = 'appear';
		this._reactionSpriteSet = false;
		this._reactWaitSpriteBitmap = ImageManager.loadSystem("reactionWait");
		this._reactHitSpriteBitmap = ImageManager.loadSystem("reactionHit");
		this._reactSprite = new Sprite(this._reactWaitSpriteBitmap);
		this._reactSprite.visible = false;
		this._spriteset.addChild(this._reactSprite);
	};

	Scene_Battle.prototype.appearReaction = function(item) {
		var appearTimer = paramDefaultReactAppear;
		if (appearTimer[0] === ' ') appearTimer = appearTimer.substr(1);
		appearTimer = appearTimer.split(' ');
		appearTimer = Math.randomInt(Number(appearTimer[1]) - Number(appearTimer[0])) + Number(appearTimer[0]);

		var windowTimer = paramDefaultReactWindow;
		if (windowTimer[0] === ' ') windowTimer = windowTimer.substr(1);
		windowTimer = windowTimer.split(' ');
		windowTimer = Math.randomInt(Number(windowTimer[1]) - Number(windowTimer[0])) + Number(windowTimer[0]);

		var state = paramDefaultStateId;

		if (item.meta.ReactionWindow)
		{
			var timer = item.meta.ReactionWindow;
			if (timer[0] === ' ') timer = timer.substr(1);
			timer = timer.split(' ');
			windowTimer = Math.randomInt(Number(timer[1]) - Number(timer[0])) + Number(timer[0]);
		}
		if (item.meta.ReactionAppear)
		{
			var timer = item.meta.ReactionAppear;
			if (timer[0] === ' ') timer = timer.substr(1);
			timer = timer.split(' ');
			appearTimer = Math.randomInt(Number(timer[1]) - Number(timer[0])) + Number(timer[0]);
		}
		if (item.meta.ReactionState)
		{
			state = Number(item.meta.ReactionState);
		}
		this._reactionAppearTimer = appearTimer;
		this._reactionWindowTimer = windowTimer;
		this._reactionState = state;
		this._reactionStatus = 'appear';
	};

	var _SceneBattle_update = Scene_Battle.prototype.update;
	Scene_Battle.prototype.update = function() {
		_SceneBattle_update.call(this);
		if (this._reactSprite.visible)
		{
			if (!this._reactSpriteSet && this._reactSprite.bitmap.isReady()) {
				this._reactSprite.x = Graphics.boxWidth/2 - this._reactSprite.width/2;
				this._reactSprite.y = Graphics.boxHeight/2 - this._reactSprite.height/2;
				this._reactSpriteSet = true;
			}
			if (this._reactionStatus === 'appear')
			{
				if (Input.isTriggered('ok') || TouchInput.isTriggered())
				{
					this._reactionAppearTimer = 999;
					this._reactionWindowTimer = 0;
					this._reactionStatus = 'off';
					this._reactSprite.visible = false;
					this._reactSprite.bitmap = this._reactWaitSpriteBitmap;
					AudioManager.playStaticSe(this._failSfx);
				}

				this._reactionAppearTimer -= 1;
				if (this._reactionAppearTimer <= 0) {
					this._reactionStatus = 'window';
					this._reactSprite.bitmap = this._reactHitSpriteBitmap;
				} 
			}
			if (this._reactionStatus === 'window')
			{
				var played = false;
				if (Input.isTriggered('ok') || TouchInput.isTriggered())
				{
					this._reactionWindowTimer = 0;
					var actor = BattleManager._subject;
					actor.addState(this._reactionState);
					actor._reactionStateId = this._reactionState;
					AudioManager.playStaticSe(this._successSfx);
					played = true;
				}
				this._reactionWindowTimer -= 1;
				if (this._reactionWindowTimer <= 0) {
					this._reactionStatus = 'off';
					this._reactSprite.visible = false;
					this._reactSprite.bitmap = this._reactWaitSpriteBitmap;
					if (!played) AudioManager.playStaticSe(this._failSfx);			
				}
			}
		}
	};

	var _SceneBattle_isAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
	Scene_Battle.prototype.isAnyInputWindowActive = function() {
		var active = _SceneBattle_isAnyInputWindowActive.call(this);
		return active || this._reactSprite.visible;
	};

	var _GameActor_useItem = Game_Actor.prototype.useItem;
	Game_Actor.prototype.useItem = function(item) {
		if (item.meta.Reaction)
		{
			if (SceneManager._scene.constructor === Scene_Battle)
			{
				SceneManager._scene.appearReaction(item);
				SceneManager._scene._reactSprite.visible = true;
			}			
		}
		_GameActor_useItem.call(this, item);
	};

	var _Battlemanager_endAction = BattleManager.endAction;
	BattleManager.endAction = function() {
		if (this._subject._reactionStateId > 0)
		{
			this._subject.removeState(this._subject._reactionStateId);
			this._subject.reactionStateId = 0;
		}
		_Battlemanager_endAction.call(this);
	};
})();
