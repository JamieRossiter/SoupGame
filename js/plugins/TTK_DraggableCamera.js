//=============================================================================
// TTK - Draggable Camera (v1.1.4)
// by Fogomax
//=============================================================================

/*:
  * @author Fogomax
  * @plugindesc This plugin allows the player to drag and move the camera 
  * with the mouse or touch
  *
  <TTK DraggableCamera>
  * @help
  * ===========================================================================
  * * Explanation
  * ===========================================================================
  * This plugins allows the player to drag and move the camera with the mouse
  * or touch
  *
  * ===========================================================================
  * * Use
  * ===========================================================================
  * To turn on/off the plugin, user the following plugin command:
  *  - DraggableCamera setEnabled x
  * Here "x" can be "true" (on) or "false" (off), without the ("). Example:
  *  - DraggableCamera setEnabled true
  
  @param Start On
  @desc If the screen is draggable in the begin of game
  @default true
  
  @param Cancel Player Move
  @desc Cancel the player move when the camera is moved
  @default true
  
  @param Speed
  @desc Speed of move (the higher the faster). E. g.: 2.3.
  @default 1
  
  @param Distance Limit
  @desc The max distance that a single drag can move, this prevents unexpected moves.
  @default 10
*/

"use strict";

var Imported = Imported || {};
Imported["TTK_DraggableCamera"] = "1.1.4";

var TTK = TTK || {};
TTK.DraggableCamera = {};

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<TTK DraggableCamera>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Plugin global variables
	//

	$.cancelPlayerMove = ($.Params["Cancel Player Move"].toLowerCase() === 'true');
	$.enabled = ($.Params["Start On"].toLowerCase() === 'true');
	$.speed = parseFloat($.Params["Speed"]);
	$.distanceLimit = parseInt($.Params['Distance Limit']);
	$.denyMove = false;

	// Added by Jamie Rossiter
	$.rightClick = false;

	// Right Click Mouse Down Listener - Added by Jamie Rossiter
	document.addEventListener("mousedown", event => {
		if(event.button === 2) $.rightClick = true;
	})
	// Right Click Mouse Up Listener - Added by Jamie Rossiter
	document.addEventListener("mouseup", event => {
		if(event.button === 2) $.rightClick = false;
	})

	//-----------------------------------------------------------------------------
	// TouchInput
	//

	var _TouchInput_clear = TouchInput.clear;

	TouchInput.clear = function() {
		_TouchInput_clear.call(this);
		this._lastCameraX = 0;
		this._lastCameraY = 0;
		this._cameraAccX = 0;
		this._cameraAccY = 0;
		this._storForceX = 0;
		this._storForceY = 0;
	};

	if (TTK.SwipeMove && $.enabled) {
		var _TouchInput_update = TouchInput.update;
		TouchInput.update = function() {
			_TouchInput_update.call(this);

			if (this._cameraAccX && $gameMap) {
				if (this._cameraAccX > 0) {
					$gameMap._displayX -= this._cameraAccX / 48;
					this._cameraAccX = (this._cameraAccX - this._storForceX < 0) ? (0) : (this._cameraAccX - this._storForceX);
				}
				if (this._cameraAccX < 0) {
					$gameMap._displayX -= this._cameraAccX / 48;
					this._cameraAccX = (this._cameraAccX - this._storForceX > 0) ? (0) : (this._cameraAccX - this._storForceX);
				}
			}

			if (this._cameraAccY && $gameMap) {
				if (this._cameraAccY > 0) {
					$gameMap._displayY -= this._cameraAccY / 48;
					this._cameraAccY = (this._cameraAccY - this._storForceY < 0) ? (0) : (this._cameraAccY - this._storForceY);
				}
				if (this._cameraAccY < 0) {
					$gameMap._displayY -= this._cameraAccY / 48;
					this._cameraAccY = (this._cameraAccY - this._storForceY > 0) ? (0) : (this._cameraAccY - this._storForceY);
				}
			}
		};
	}

	// var _TouchInput_onTrigger = TouchInput._onTrigger; Edited by Jamie Rossiter - prevents having to double click to move the character

	// TouchInput._onTrigger = function(x, y) {
	// 	if (this.isMoved()) return;
	// 	_TouchInput_onTrigger.call(this, x, y);
	// 	this._lastCameraX = this.x;
	// 	this._lastCameraY = this.y;
	// };

	var _TouchInput_onMouseMove = TouchInput._onMouseMove;
	TouchInput._onMouseMove = function(event) {
		var x = Graphics.pageToCanvasX(event.pageX);
		var y = Graphics.pageToCanvasY(event.pageY);
		this._onMove(x, y);
		_TouchInput_onMouseMove.call(this, event);
	};
	
	var _TouchInput_onMove = TouchInput._onMove;

	TouchInput._onMove = function(x, y) {
		if ($.cancelPlayerMove)
			$.denyMove = true;
		this._lastCameraX = this.x;
		this._lastCameraY = this.y;
		_TouchInput_onMove.call(this, x, y);
	};

	var _TouchInput_onRelease = TouchInput._onRelease;

	TouchInput._onRelease = function(x, y) {
		_TouchInput_onRelease.call(this, x, y);
		if (TTK.SwipeMove) {
			this._cameraAccX = this._forceX;
			this._cameraAccY = this._forceY;
			this._storForceX = this._forceX / 48;
			this._storForceY = this._forceY / 48;
		}
		if ($.denyMove) $.denyMove = false;
	};

	//-----------------------------------------------------------------------------
	// Scene_Map
	//
	var _Scene_Map_initialize = Scene_Map.prototype.initialize;

	Scene_Map.prototype.initialize = function() {
		_Scene_Map_initialize.call(this);
	};

	var _Scene_Map_update = Scene_Map.prototype.update;

	Scene_Map.prototype.update = function() {
		_Scene_Map_update.call(this);

		// Added by Jamie Rossiter - change cursor if the right click button is being held down
		// if($.rightClick){
		// 	$gameTemp.changeCursor("cursor_grab");
		// }

		if (TouchInput.isMoved() && $.enabled && $.rightClick) { // Edited by Jamie Rossiter - check to see if the right click button is pressed to move the camera
			var newX = ((TouchInput._lastCameraX - TouchInput.x) / 48) * $.speed;
			var newY = ((TouchInput._lastCameraY - TouchInput.y) / 48) * $.speed;
			if (newX) $gameMap._displayX += Math.min(newX, $.distanceLimit);
			if (newY) $gameMap._displayY += Math.min(newY, $.distanceLimit);
		}

		if ((TouchInput.isMoved() || TouchInput._cameraAccX || TouchInput._cameraAccY) && $.enabled) {
			if ($gameMap._displayX + Graphics.width / 48 >= $dataMap.width) {
				$gameMap._displayX = $dataMap.width - Graphics.width / 48;
				if (TTK.SwipeMove) {
					TouchInput._cameraAccX = 0;
					TouchInput._storForceX = 0;
				}
			}
			else if ($gameMap._displayX <= 0) {
				$gameMap._displayX = 0;
				if (TTK.SwipeMove) {
					TouchInput._cameraAccX = 0;
					TouchInput._storForceX = 0;
				}
			}

			if ($gameMap._displayY + Graphics.height / 48 >= $dataMap.height) {
				$gameMap._displayY = $dataMap.height - Graphics.height / 48;
				if (TTK.SwipeMove) {
					TouchInput._cameraAccY = 0;
					TouchInput._storForceY = 0;
				}
			} else if ($gameMap._displayY <= 0) {
				$gameMap._displayY = 0;
				if (TTK.SwipeMove) {
					TouchInput._cameraAccY = 0;
					TouchInput._storForceY = 0;
				}
			}
		}
	};

	//-----------------------------------------------------------------------------
	// Game_Player
	//

	var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;

	Game_Player.prototype.moveByInput = function() {
		if ($.cancelPlayerMove && $.enabled) {
			if (!this.isMoving() && this.canMove() && !$.denyMove) {
				var direction = this.getInputDirection();
				if (direction > 0) {
					$gameTemp.clearDestination();
				} else if ($gameTemp.isDestinationValid()) {
					var x = $gameTemp.destinationX();
					var y = $gameTemp.destinationY();
					direction = this.findDirectionTo(x, y);
				}
				if (direction > 0) {
					this.executeMove(direction);
				}
			}
		} else {
			_Game_Player_moveByInput.call(this);
		}
	};

	Game_Player.prototype.update = function(sceneActive) {
		var lastScrolledX = this.scrolledX();
		var lastScrolledY = this.scrolledY();
		var wasMoving = this.isMoving();
		this.updateDashing();
		if (sceneActive) {
			this.moveByInput();
		}
		Game_Character.prototype.update.call(this);
		// this.updateScroll(lastScrolledX, lastScrolledY); Edited by Jamie Rossiter - prevent scrolling when character moves
		this.updateVehicle();
		if (!this.isMoving()) {
			this.updateNonmoving(wasMoving);
		}
		this._followers.update();
	};

	//-----------------------------------------------------------------------------
	// Plugin command
	//

	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toLowerCase() === "draggablecamera") {
			if (args[0].toLowerCase() === "setenabled") {
				$.enabled = (args[1].toLowerCase() === 'true');
			}
		}
	};
})(TTK.DraggableCamera);
