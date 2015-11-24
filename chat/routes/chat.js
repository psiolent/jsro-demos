var express = require('express');
var jsro = require('jsro').create(express.Router);

var instances = [];
var nextID = 0;

jsro.factory('chat', function(context) {
	if (typeof context.spec.handle !== 'string') {
		throw 'invalid or missing handle';
	}

	var instance = {};
	instance.fire = context.fire;

	function say(message) {
		instances.forEach(function(instance) {
			instance.fire('message', context.spec.handle, message);
		});
	}

	instances.forEach(function(instance) {
		instance.fire('joined', context.spec.handle);
	});

	var instanceID = nextID++;
	instances[instanceID] = instance;

	context.on('destroy', function() {
		delete instances[instanceID];
		instances.forEach(function(instance) {
			instance.fire('left', context.spec.handle);
		});
	});

	return {
		say: say
	};
});

jsro.dataProperty(undefined);
jsro.sessionProperty(undefined);

module.exports = jsro;
