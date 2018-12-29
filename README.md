# aprico-gen
Deterministic password generator based on `scrypt` algorithm.

This javascript library generates passwords that:
- are derived deterministically purely on user inputs (a master password, a service, an ID and other options);
- are generated 100% client-side in the browser;
- do not need to store data or keep any state.

For the full implementation see [aprico.org](https://aprico.org).

Uses the [scrypt-async-js](https://github.com/dchest/scrypt-async-js) `scrypt` javascript implementation.

How it works
------------

User inputs are concatenated and hashed through the `scrypt` algorithm with a cost of N = 2^14. The resulting hash is then splitted, re-iterated with a lighter cost (N = 2^5) while arbirtary converted to a custom alphabet made of letters, numbers and/or symbols.

The result is checked for some conditions (at least a character for each alphabet, no character repeated more than 2 times) and eventually re-hashed until those conditions are met.

Install
-------

`aprico-gen` is available on NPM:

    $ npm i aprico-gen 

You can use it as a CommonJS module:

    const aprico = require('aprico-gen');

Or directly in your browser (but without dependencies, so you may want to include also the `scrypt-async-js` library):

```javascript
<script src="https://unpkg.com/scrypt-async@2.0.1/scrypt-async.min.js"></script>
<script src="https://unpkg.com/aprico-gen"></script>
```

API
---

#### `getPassword(password, service, hashId, options)`

Derives a unique password and a hash based on user inputs. You can use the hash as an entropy source to implement your own alphabet or to create other deterministic derivatives. `hashId` is actually used as a salt, you can use a hash pre-generated with `getHashId` (see later) or implement your own.

```javascript
// default options:
let options = {
	length : 20, // min 4, max 40
	letters : true, // use letters (abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ)
	numbers : true, // use numbers (123456789)
	symbols	: true, // use symbols (_!$-+)
	variant : false // or STRING, to get a different password while preserving other inputs
}

let results = aprico.getPassword ('letmein', 'website.com', hashId, options);

console.log(results);
// {
//  	pass: 'vnscMKN_9z5a$cQC+J8G',
//  	hash: 'f9e5ce41fc655f8cdd2a103e0ed7b1db99a4618f517d6aa324e406268a650d96'
// }
```

#### `getHashId(id)`

Derives a hash from the user ID that can be used as a salt in `getPassword`. This can be saved on your end for later re-use.

```javascript
let hashId = aprico.getHashId('user@email.com');

console.log(hashId)
// "263f5a46fc0abcee64e59c086327b15cc07f0ec7b7fc16ee2ca5b791e6e63477"
```

#### `normalizeService(service)`

Returns a lowecased `service` and, if it is a URL, it is stripped down to hostname only to improve user usability.

```javascript
let service = aprico.normalizeService('https://www.website.com/login');

console.log(service); // 'www.website.com'
```

#### `version`

Returns the current version number.

```javascript
console.log( aprico.version ) // "1.0.0"
```

Unit Test
---------

Tests are available via npm:

    $ npm run test

Browser support
---------------

This library is written in vanilla (untraspiled) ES6, so is targeted to modern browsers only: FireFox 52+, Chrome 55+, Edge 15+, Safari 10.1+, iOS Safari 10.3+.

Changelog
---------

See [CHANGELOG.md](CHANGELOG.md)

License
-------

This project is licensed under the GPLv3 License - see [LICENSE](LICENSE) for details.