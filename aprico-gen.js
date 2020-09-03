/*!
 * aprico-gen
 * Deterministic password generator library based on scrypt algorithm.
 * Copyright (c) 2018 Pino Ceniccola | GPLv3
 * https://aprico.org
 */

const aprico = (()=> {
	'use strict';

	const scrypt = (typeof module !== 'undefined' && module.exports) ? require('scrypt-async') : window.scrypt;

	if (typeof scrypt !== 'function')
		throw new Error("aprico requires scrypt-async-js library.");

	const VERSION = "1.1.1";

	const SCRYPT_COST = {
    	N: Math.pow(2,14),
    	r: 8,
    	p: 1,
    	dkLen: 32,
    	encoding: 'hex'
	};

	const SCRYPT_COST_FAST = {
    	N: Math.pow(2,5),
    	r: 8,
    	p: 1,
    	dkLen: 32,
    	encoding: 'hex'
	};

	const ALPHABET = {
		letters : 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
		numbers : '123456789',
		symbols : '_!$-+'
	};

	let options = {
		length : 20,
		letters : true,
		numbers : true,
		symbols	: true,
		variant : false
	};


	/**
	* Arbitrary conversion from one character set to another,
	* using Base 10 as an intermediate base for conversion.
	* Used by _hashToAlphabet().
	* (Adapted from: https://rot47.net/base.html)
	* @param {string} src - String to convert.
	* @param {string} srctable - Source character set.
	* @param {string} srcdest - Destination character set.
	* @returns {string} Converted string.
	*/
	const _convert = (src, srctable, desttable) => {
		const srclen = srctable.length;
		const destlen = desttable.length;
		// Convert to base 10
		let val = 0;
		for (let i=0, numlen = src.length; i<numlen; i++) {
			val = val * srclen + srctable.indexOf(src.charAt(i));
		};
		if (val<0) {return 0;}
		// Then convert to destination base
		let r = val % destlen;
		let res = desttable.charAt(r);
		let q = Math.floor(val/destlen);
		while (q) {
			r = q % destlen;
			q = Math.floor(q/destlen);
			res = desttable.charAt(r) + res;
		}
		return res;
	};


	/**
	 * Convert full hex hash to password format
	 * set by options (alphabet and length)
	 * @param {string} hash - Hash in hex format.
	 * @returns {string} The generated password.
	 */
	const _hashToAlphabet = (hash) => {
		let alphabet = '';
		if (options.symbols) alphabet += ALPHABET.symbols;
		if (options.numbers) alphabet += ALPHABET.numbers;
		if (options.letters) alphabet += ALPHABET.letters;

		let result = '';

		// We split the full hash because... 32bit
		let split = hash.match(/(.{1,7})/g);
		for (let i = 0, l = split.length-1; i < l; i++) {

			//[debug] console.log('Split', split);

			// Re-hash every slice when revealing a potentially
			// large chunk of the original hash.
			if (options.length > 9) {

				//[debug] console.log('Re-hashing', hash, split[l-i-1]);

				scrypt (hash, split[l-i-1], SCRYPT_COST_FAST, (hash) => split = hash.match(/(.{1,7})/g) );
			}

			result += _convert(split[i], '0123456789abcdef', alphabet);

		};

		//[debug] console.log('Full converted string', result);

		// Better safe than sorry
		if (result.length<=options.length) return ".";

		// Trim password to options.length
		let offset = ((result.length-options.length)/2)|0;

		//[debug] console.log('Trim offset', offset);

		result = result.substring(offset, offset + options.length);

		// Make sure first character is [A-z]
		// because... silly password rules
		let firstChar = result.charAt(0);
		if (options.letters && options.length > 6 && !/[a-zA-Z]/.test(firstChar)) {

			//[debug] console.log('First character to be replaced', result);

			result = result.replace(firstChar, _convert(firstChar, ALPHABET.symbols+ALPHABET.numbers, ALPHABET.letters));
		}

		return result;
	};


	/**
	 * Check if the generated password has characters from
	 * every alphabet set. If not, re-hash until conditions are met.
	 * @param {object} results - Password + Hash.
	 * @returns {object} Password + Hash.
	 */
	const _checkAndIterate = (results) => {

		let success = false;

		while (!success) {

			success = true;

			// Check for...
			// 1. at least one uppercase, one lowecase letter, no letter repeated three times (eg. aaa)
			if ( options.letters && ( !/[a-z]/.test(results.pass) || !/[A-Z]/.test(results.pass) || /([A-z])\1{2}/.test(results.pass) ) ) success = false;

			// 2. at least one number and no number repeated three times (eg. 111)
			if ( success && options.numbers && ( !/[\d]/.test(results.pass) || /([\d])\1{2}/.test(results.pass) ) ) success = false;

			// 3. at least one symbol and no symbol repeated three times (eg. $$$)
			if ( success && options.symbols && ( !/[!$\-+_]/.test(results.pass) || /([!$\-+_])\1{2}/.test(results.pass) ) ) success = false;


			if (!success) {

				//[debug] console.log('Iterating', results);

				// Re-hash until conditions are met.
				scrypt (results.hash, results.pass, SCRYPT_COST_FAST, (hash) => results.hash = hash );

				results.pass = _hashToAlphabet(results.hash);

			}

		}

		return results;

	};


	/**
	 * Merge and check user options.
	 * @param {object} user_options	- User options.
	 */
	const _checkOptions = (user_options) => {

		for (let opt in options)
			if (user_options.hasOwnProperty(opt))
				options[opt] = user_options[opt];

		options.letters = !!options.letters;
		options.numbers = !!options.numbers;
		options.symbols = !!options.symbols;

		if (!options.letters && !options.symbols && !options.numbers)
			throw new Error("At least one character set (letters, numbers, symbols) must be chosen.");

		options.length = +options.length;

		if (typeof options.length !== 'number' || options.length < 4 || options.length > 40)
			throw new Error("Password length must be a number between 4 and 40.");

	};


	/**
	 * Deterministic password generation main function.
	 * @param {string} password	- User Master Password.
	 * @param {string} service - User service/domain.
	 * @param {string} hashId - Precomputed hash ID.
	 * @param {object} user_options	- User options.
	 * @returns {object} Password + Hash.
	 */
	const getPassword = (password, service, hashId, user_options) => {

		if (user_options) _checkOptions(user_options);

		service = normalizeService(service);

		let pass = password + '.' + service + '.' + options.length + (+options.letters) + (+options.symbols) + (+options.numbers);

		if (options.variant && typeof options.variant === 'string') pass += '.' + options.variant;

		//[debug] console.log('String to hash', pass);

		let results = {};

		// Note: scrypt callback is called immediately, in a synchronous fashion here.
		// See https://github.com/dchest/scrypt-async-js#usage
		scrypt (pass, hashId, SCRYPT_COST, (hash) => results.hash = hash);

		results.pass = _hashToAlphabet(results.hash);
		results = _checkAndIterate(results);

		//[debug] console.log('Results', results);

		return results;

	};



	/**
	 * Generate a hash from the user ID.
	 * @param {string} id - User ID.
	 * @returns {string} Hash ID.
	 */
	const getHashId = (id) => {
		let output = '';

		// In order to create a hash from the ID using scrypt,
		// we need to generate some deterministic salt and it's
		// not a bad thing.
		// Rationale: ID is a salt. It's not a secret.
		// We are not hashing a password.
		// We are converting ID to a hash more for convenience
		// than security here.
		let salt = Math.pow(id.length, (id.match(/[aeiou]/gi) || [0,0,0]).length)+'';
		salt = _convert(salt, '0123456789.e+Infity', ALPHABET.numbers+ALPHABET.symbols+ALPHABET.letters)+'';

		//[debug] console.log('Hash ID salt',salt);

		scrypt(id, salt, SCRYPT_COST, (hash) => output = hash);

		return output;
	};


	/**
	 * If Service is a URL, it is stripped down to hostname (and
	 * perhaps port number) to improve usability.
	 * @param {string} service - User Service.
	 * @returns {string} - Normalized Service.
	 */
	const normalizeService = (service) => {

		service = service.trim().toLowerCase();

		// Strip http(s)://
		if (service.substring(0, 4) == 'http') {
			service = service.substring(service.indexOf('://')+3, service.length);
		}

		// if string contains any "/" take only the first part
		if (service.indexOf('.') !== -1 && service.indexOf('/') !== -1) {
			service = service.split('/');
			service = service[0];
		}

		//[debug] console.log('Normalized Service', service);

		return service;
	};


	return {
		getPassword : getPassword,
		getHashId : getHashId,
		normalizeService : normalizeService,
		version : VERSION
	};

})();


if (typeof module !== 'undefined' && module.exports) {
	module.exports = aprico;
} else {
	window.aprico = aprico;
}