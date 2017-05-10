;'use strict';
const auth = (function (wsChat, Q) {
	const CHAT = wsChat;
	const AJAX = Q.AJAX;
	const $ = Q.$;

	let authElem = $('.auth');
	let loaderElem = $('.loader');
	let parentElem = authElem.parentElement;
	let regBtn = authElem.querySelector('.auth-btn');

	console.log(regBtn);

	$('[name="login"]').onsubmit = submitForm;

	let _hideForm = function () {
		authElem.style.display = 'none';
	};

	let _hideLoader = function () {
		loaderElem.style.display = 'none';
	};

	let _showForm = function () {
		authElem.style.display = 'flex';
	};

	let _showLoader = function () {
		loaderElem.style.display = 'flex';
	};

	let _toggleVisible = function () {
		if (authElem.style.display === 'none') {
			_hideLoader();
			_showForm();
		} else {
			_hideForm();
			_showLoader();
		}
	}

	let _removeAuth = function () {
		parentElem.removeChild(authElem);
	};

	/* Functions */
	function submitForm(e) {
		e.preventDefault();
		_toggleVisible();

		let data = {
			nick: $('.auth-input[type="text"]').value,
			password: $('.auth-input[type="password"]').value
		};

		AJAX({
			method: "POST",
			url: "/clients",
			data: JSON.stringify(data),
			done: function () {
				_hideLoader();
				_removeAuth();
				CHAT.init();
			},
			error: function () {
			},
			always: function () {
				_toggleVisible();
			}
		});
	}

	return {};
})(wsChat, Q);