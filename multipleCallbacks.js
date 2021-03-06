var debugLog = require('debug')('MultipleCallbacks:log');
var debugWarning = require('debug')('MultipleCallbacks:warning');

function MultipleCallbacks (timesToFire, callback, name) {

	if (!(this instanceof MultipleCallbacks)) return new MultipleCallbacks(timesToFire, callback);

	if(typeof name !== 'undefined')
		this.name = name;
	else
		this.name = "unidentified";

	this.firedTimes = 0;
	this.timesToFire = timesToFire;
	this.callback = callback;
	this.savedData = [];

	var preCallback = this.createPreCallback();

	var isNumber = typeof timesToFire == 'number';

	if( isNumber && timesToFire <= 0) preCallback();

	return preCallback;
}

module.exports = exports = MultipleCallbacks;

MultipleCallbacks.prototype.setTimesToFire = function(timesToFire) {
	this.timesToFire = timesToFire;

	if(this.firedTimes >= this.timesToFire) this._launchCallback();

	return timesToFire;
};

MultipleCallbacks.prototype.getTimesToFire = function() {
	return this.timesToFire;
};

MultipleCallbacks.prototype.getFiredTimes = function() {
	return this.firedTimes;
};

MultipleCallbacks.prototype.sumTimesToFire = function(quantity) {
	var timesToFire = this.timesToFire + quantity;

	this.setTimesToFire(timesToFire);
};

MultipleCallbacks.prototype._preCallback = function() {
	this.firedTimes++;

	return this._launchCallback();
};

MultipleCallbacks.prototype._launchCallback = function() {
	if(this.timesToFire === false) return false;

	if(this.firedTimes >= this.timesToFire && this.callback){
		if(this.savedData.length > 1) this.callback(this.savedData);
		else if(this.savedData.length === 1) this.callback(this.savedData[0]);
		else this.callback();
	}

	debugLog('Fired ' + this.name + ' ' + this.firedTimes + ' times. Times to fire: ' + this.timesToFire);

	var remainingTimesTofire = this.timesToFire - this.firedTimes;

	if (remainingTimesTofire < 0) debugWarning('Callback ' + this.name + ' fired more times than expected. Relauching user callback.');

	return remainingTimesTofire;
};

MultipleCallbacks.prototype.createPreCallback = function() {
	var _this = this;

	function preCallback (data){
		if(typeof data !== 'undefined') _this.savedData.push(data);
		return _this._preCallback();
	}

	preCallback.setTimesToFire = function(timesToFire){
		return _this.setTimesToFire(timesToFire);
	};

	preCallback.getTimesToFire = function(){
		return _this.getTimesToFire();
	};

	preCallback.getFiredTimes = function(){
		return _this.getFiredTimes();
	};

	preCallback.sumTimesToFire = function(quantity){
		return _this.sumTimesToFire(quantity);
	};

	return preCallback;
};
