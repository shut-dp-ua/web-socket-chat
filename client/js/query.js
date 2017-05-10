;'use strict';
const Q = (function () {
	this.methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATH', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE'];

	let _AJAX = function ({url = null, method = "GET", async = true, user, password, data, timeout, contentType = 'application/json', done, error, always} = {}) {
		let xhr = new XMLHttpRequest();
		let getResponse = function () {
			if (xhr.readyState !== 4) return;
			if (xhr.status !== 200) {
				if(typeof error === 'function') {
					error({status: xhr.status, statusText: xhr.statusText});
				} else {
					throw new Error(`${xhr.status}: ${xhr.statusText}`);
				}
			} else {
				if (typeof done === 'function') done(xhr.responseText);
			}
			if (typeof always === 'function') always();
		};

		/* Проверка url */
		if (typeof url !== 'string') throw new TypeError('Укажите url запроса');

		/* Проверка метода */
		for(let i = 0; i < this.methods.length; i++) {
			if (this.methods[i] === method) break;
			if (i+1 === this.methods.length) throw new TypeError('Неверно указан метод запроса');
		}

		/* Проверка синхронный/асинхронный запрос */
		if (typeof async !== 'boolean') throw new TypeError('Укажите аргумент "async" в правильном формате: true / false');

		/* Установка timeout */
		if (typeof timeout === "number") {
			xhr.timeout = timeout;
		} else if (typeof timeout !== "undefined") {
			throw new TypeError('Укажите "timeout" в миллисекундах');
		}

		xhr.open(method, url, async, user, password);

		/* Установка Content-Type */
		xhr.setRequestHeader('Content-Type', contentType);

		data ? xhr.send(data) : xhr.send();

		async ? xhr.onreadystatechange = getResponse : getResponse();
	};

	let _$ = function (attr, cb) {
		let query = document.querySelectorAll(attr);
		let elements;

		if (query.length > 1) {
			elements = Array.prototype.slice.call(query);
		} else {
			elements = query[0];
		}

		if (typeof cb === 'function' && elements) cb.call(elements);

		return elements ? elements : null;
	};

	return {
		AJAX: _AJAX,
		$: _$
	};
})();