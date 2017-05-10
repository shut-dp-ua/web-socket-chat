"use strict";

const fs = require('fs');
const webSocketServer = require('ws').Server;
const MongoClient = require('mongodb').MongoClient;
const HTTP_PORT = 3000;
const WS_PORT = 5000;
const MONGODB_URL = 'mongodb://localhost:27017/wsChat';

let db;
let clients = {};

require('http').createServer((req, res) => {
	switch(req.url) {
		case '/':
			let html = fs.readFileSync('./client/index.html', 'utf-8');
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(html);
			break;

		case '/css/reset.min.css':
			let reset = fs.readFileSync('./client/css/reset.min.css', 'utf-8');
			res.writeHead(200, {'Content-Type': 'text/css'});
			res.end(reset);
			break;

		case '/css/style.css':
			let style = fs.readFileSync('./client/css/style.css', 'utf-8');
			res.writeHead(200, {'Content-Type': 'text/css'});
			res.end(style);
			break;

		case '/js/query.js':
			let query = fs.readFileSync('./client/js/query.js', 'utf-8');
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(query);
			break;

		case '/js/chat.js':
			let chat = fs.readFileSync('./client/js/chat.js', 'utf-8');
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(chat);
			break;

		case '/js/auth.js':
			let auth = fs.readFileSync('./client/js/auth.js', 'utf-8');
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(auth);
			break;

		case '/users':
			db.collection('users').findOne({name: 'Shut'}, function (err, docs) {
				if (err) {
					console.log(err);
					res.writeHead(404, {'Content-Type': 'text/plain'});
					res.end(err);
				}
				console.log(docs);
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(docs));
			});
			break;

		case '/clients':
			if (req.headers["content-type"] === 'application/json' && req.method === 'POST') {
				let client;

				req.on('data', function (data) {
					client = JSON.parse(data.toString());
				});

				req.on('end', function () {
					db.collection('users').findOne({name: client.nick}, function (err, doc) {
						if (err) {
							console.log(err);
							res.writeHead(404, {'Content-Type': 'text/plain'});
							res.end(err);
						}

						if (doc.password === client.password) {
							let response = {
								name: doc.name
							};

							res.writeHead(200, {'Content-Type': 'application/json'});
							setTimeout(function () {
								res.end(JSON.stringify(response));
							}, 1000);
						} else {
							res.writeHead(404, {'Content-Type': 'text/plain'});
							setTimeout(function () {
								res.end('Page not found');
							}, 3000);
						}
					});
				})
			} else {
				res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
				res.end('Запрос был не XHR, проверьте включен ли javascript в браузере');
			}
			break;

		default:
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('404 page not found');
	}

}).listen(HTTP_PORT, () => console.log(`HTTP сервер запущен по адресу: localhost:${HTTP_PORT}`));

MongoClient.connect(MONGODB_URL, function (err, database) {
	if (err) console.log(err);
	db = database;
});

new webSocketServer({port: WS_PORT}, () => console.log(`WebSocket сервер запущен по адресу: localhost:${WS_PORT}`))
	.on('connection', ws => {
		let id = Math.random();
		clients[id] = ws;
		console.log(`Новое соединение ${id}`);

		ws.on('message', function (message) {
			console.log(`Получено сообщение: ${message}`);

			for (let key in clients) {
				clients[key].send(message);
			}
		});

		ws.on('close', function () {
			console.log(`Соединение закрыто ${id}`);
			delete clients[id];
		});
	});