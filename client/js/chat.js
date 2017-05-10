;'use strict';
const wsChat  = (function ($) {
	let socket = {};
	let chat = document.createElement('ws-chat');
	let chatForm = document.createElement('form');
	let chatInput = document.createElement('input');
	let chatMessages = document.createElement('div');
	let $elem = $;

	class Chat {
		constructor() {
			this.className = 'chat';
		}
	}

	class ChatForm {
		constructor() {
			this.className = 'chat-form';
			this.name = 'publish';
		}
	}

	class ChatInput {
		constructor() {
			this.className = 'chat-input';
			this.type = 'text';
			this.name = 'message';
			this.disabled = true;
			this.autocomplete = 'off';
			this.placeholder = 'Введите текст сообщения...';
		}
	}

	class ChatMessages {
		constructor() {
			this.className = 'chat-messages';
			this.id = 'subscribe';
		}
	}

	/* Methods */

	let _init = function () {
		setAttributes(
			[chat, chatForm, chatInput, chatMessages],
			[new Chat(), new ChatForm(), new ChatInput(), new ChatMessages()]
		);
		_createChat();
		_runChat('ws://localhost:5000');
	};

	let _createChat = function () {
		if (!$elem('ws-chat')) {
			document.body.appendChild(chat);
			chat.appendChild(chatForm);
			chatForm.appendChild(chatInput);
			chat.appendChild(chatMessages);

			return chat;
		} else {
			throw new TypeError('wbChat already initialized!');
		}
	};

	let _runChat = function (url) {
		if (socket.readyState === socket.CLOSED) {
			socket = new WebSocket(url);
			socket.onopen = _wsOnopen;
			socket.onclose = _wsOnclose;
			socket.onmessage = _wsOnmessage;
			socket.onerror = _wsOnerror;
			chatForm.onsubmit = _submitMessage;

			return socket;
		} else {
			throw new Error('WebSocket already initialized!');
		}
	};

	let _stopChat = function () {
		if (socket.readyState && socket.readyState === (socket.CONNECTING || socket.OPEN)) {
			socket.close();
			return null;
		} else {
			throw new Error('WebSocket already closed!');
		}
	};

	let _submitMessage = function() {
		socket.send(this.message.value);
		chatInput.value = null;

		return false;
	};

	let _wsOnopen = function () {
		chatInput.disabled = false;
		chatInput.focus();
		console.info('Соединение установлено.');
	};

	let _wsOnclose = function (event) {
		chatInput.disabled = true;
		if (event.wasClean) {
			console.info('Соединение закрыто чисто');
		} else {
			console.error(`Обрыв соединения\nКод: ${event.code}\nПричина: ${event.reason}`);
		}
	};

	let _wsOnmessage = function(event) {
		let incomingMessage = event.data;
		console.info(`Получены данные: ${event.data}`);
		showMessage(incomingMessage);
	};

	let _wsOnerror = function (error) {
		console.error(`Ошибка ${error.message}`);
	};

	/* Functions */

	function setAttributes(el, attr) {
		for (let i = 0; i < el.length; i++) {
			for (let prop in attr[i]) {
				el[i][prop] = attr[i][prop];
			}
		}
	}

	function showMessage(message) {
		let messageElem = document.createElement('div');
		let subscribeElem = $elem('#subscribe');
		messageElem.className = "chat-message";
		messageElem.appendChild(document.createTextNode(message));
		subscribeElem.insertBefore(messageElem, subscribeElem.firstChild);
	}

	return {
		init: _init,
		runChat: _runChat,
		stopChat: _stopChat
	}
})(Q.$);