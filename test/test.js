/*!
 * aprico-gen Unit Test
 * Copyright (c) 2018 Pino Ceniccola | GPLv3
 * https://aprico.org
 */


const assert = require('assert');
const aprico = require('../aprico-gen.js');


const vectors = [
	{
		id: "",
		password: "",
		service: "",
		options: {
			length : 20,
			letters : true,
			numbers : true,
			symbols	: true,
			variant : false
		},
		normalizedService: "",
		hashId: "f9e5ce41fc655f8cdd2a103e0ed7b1db99a4618f517d6aa324e406268a650d96",
		result: "fx73Z74EXkaY+_VHk$nS"
	},
	{
		id: "user@email.com",
		password: "letmein",
		service: "MyApp",
		options: {
			length : 20,
			letters : true,
			numbers : true,
			symbols	: true,
			variant : false
		},
		normalizedService: "myapp",
		hashId: "263f5a46fc0abcee64e59c086327b15cc07f0ec7b7fc16ee2ca5b791e6e63477",
		result: "vnscMKN_9z5a$cQC+J8G"
	},
	{
		id: "user@email.com",
		password: "letmein",
		service: "MyApp",
		options: {
			length : 20,
			letters : true,
			numbers : true,
			symbols	: true,
			variant : "with variant"
		},
		normalizedService: "myapp",
		hashId: "263f5a46fc0abcee64e59c086327b15cc07f0ec7b7fc16ee2ca5b791e6e63477",
		result: "rge+JLaxyR39$NPDtbgb"
	},
	{
		id: "Another ID",
		password: "letters only",
		service: "https://some.domain.com:3000/login/page.html",
		options: {
			length : 20,
			letters : true,
			numbers : false,
			symbols	: false,
			variant : false
		},
		normalizedService: "some.domain.com:3000",
		hashId: "dafed7cc719e8d55108b5ba9625a4985fc34c138dd70a878cb8e94e79610f731",
		result: "APshNhiXrqyBcAyVfmjJ"
	},
	{
		id: "Why not Emoji? 👀",
		password: "strong password",
		service: "www.website.com/login",
		options: {
			length : 40,
			letters : true,
			numbers : true,
			symbols	: true,
			variant : false
		},
		normalizedService: "www.website.com",
		hashId: "4eb53750b4fd13c391db04e264e42670558332a48c55aac47f9ebe028a5abdba",
		result: "n!7a55Ga6bcH58en$K-mYd!!GD+h9LNpp+Ey$76E"
	},
	{
		id: "Very long id: His talent was as natural as the pattern that was made by the dust on a butterfly's wings. At one time he understood it no more than the butterfly did and he did not know when it was brushed or marred.",
		password: "5-digit PIN",
		service: "CustomService",
		options: {
			length : 5,
			letters : false,
			numbers : true,
			symbols	: false,
			variant : false
		},
		normalizedService: "customservice",
		hashId: "dabfadb8520288cf28cda3e95b3b16c30c33d0fac92a1e0e0dbb2773741c5f43",
		result: "16549"
	},
	{
		id: "Another Test",
		password: "with emoji 🙃",
		service: "http://intranet.lan/login",
		options: {
			length : 10,
			letters : true,
			numbers : true,
			symbols	: true,
			variant : false
		},
		normalizedService: "intranet.lan",
		hashId: "adac3e4cca4aa5b3628192973d1f138714aada28590f919b75a06b3317366d1e",
		result: "mbK$ity8$L"
	},
	{
		id: "Last one.",
		password: "very long password: His talent was as natural as the pattern that was made by the dust on a butterfly's wings. At one time he understood it no more than the butterfly did and he did not know when it was brushed or marred.",
		service: "https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&service=mail",
		options: {
			length : 20,
			letters : false,
			numbers : true,
			symbols	: true,
			variant : false
		},
		normalizedService: "accounts.google.com",
		hashId: "e3a29d04caeedd882d407528488b0d597fa4192ccbe1d6948eafc7b908465905",
		result: "8-!1-!4!5!__426$$278"
	}
]



describe("aprico-gen Unit Tests", () => {

	it("should normalize services", (done) => {
		vectors.forEach(v => {
			let service = aprico.normalizeService(v.service);
			assert.deepEqual(v.normalizedService, service);
		});
		done();
	});

	it("should generate correct Hash IDs", (done) => {
		vectors.forEach(v => {
			let hashId = aprico.getHashId(v.id);
			assert.deepEqual(v.hashId, hashId);
		});
		done();
	});

	it("should generate correct passwords", (done) => {
		vectors.forEach(v => {
			let results = aprico.getPassword(v.password, v.normalizedService, v.hashId, v.options);
			assert.deepEqual(v.result, results.pass);
		});
		done();
	});

});

