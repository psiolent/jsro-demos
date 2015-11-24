'use strict';

angular.module('app', ['jsro'])
	.controller('chatCtrl', [
		'$scope',
		'$timeout',
		'jsroService',
		function($scope, $timeout, jsroService) {
			$scope.connected = false;
			$scope.handle = null;
			$scope.messages = [];

			var connection = null;
			var chatObject = null;

			$scope.say = function() {
				if (chatObject && $scope.message) {
					chatObject.say($scope.message);
				}
				$scope.message = '';
			};

			function connect() {
				jsroService('/chat').then(onConnect, onError);
				$scope.messages.unshift('** Connecting');
			}

			function onConnect(c) {
				connection = c;
				$scope.handle = '' + parseInt(Math.random() * 900 + 100);
				connection.create('chat', {handle: $scope.handle}).then(onInstance, onError);
				connection.on('disconnect', onDisconnect);
				$scope.messages.unshift('** Connected as ' + $scope.handle);
			}

			function onInstance(o) {
				$scope.connected = true;
				chatObject = o;
				chatObject.on('message', function(handle, message) {
					$scope.messages.unshift(handle + ': ' + message);
				});
				chatObject.on('joined', function(handle) {
					$scope.messages.unshift('** ' + handle + ' Joined');
				});
				chatObject.on('left', function(handle) {
					$scope.messages.unshift('** ' + handle + ' Left');
				});
			}

			function onDisconnect() {
				$scope.connected = false;
				$scope.handle = null;
				connection = null;
				chatObject = null;
				$scope.messages.unshift('** Disconnected');
				$timeout(connect, 1e3);
			}

			function onError(e) {
				console.log("Error: %o", e);
				$scope.messages.unshift('** Error: ' + ((typeof e === 'string') ? e : 'See Log'));
				if (connection) {
					connection.disconnect();
				} else {
					$timeout(connect, 1e3);
				}
			}

			// do the initial connection
			connect();
		}]);
