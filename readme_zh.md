# HTTP API server

API document manage&http request test server.

## Installation

1. please make sure that you have installed [mongodb](https://www.mongodb.org/)
2. [Node.js](https://nodejs.org) also needs to be installed
3. install the project
```
$ git clone https://github.com/yalishizhude/api-server.git
```
or
```
$ npm install api-server
```

## Features
* based on MEAN(Mongodb,Express,Angular,Node) stack.
* support edit&view api document online.
* provide a mock server responding data to front-end without database and back-end server. 
* send request to back-end and display response.
* according to REST specification.

## Quick Start

  The quickest way to get started with express is to utilize the executable [`express(1)`](https://github.com/expressjs/generator) to generate an application as shown below:

  Install the executable. The executable's major version will match Express's:

```bash
$ npm install -g express-generator@4
```

  Create the app:

```bash
$ express /tmp/foo && cd /tmp/foo
```

  Install dependencies:

```bash
$ npm install
```

  Start the server:

```bash
$ npm start
```

## Philosophy

  The Express philosophy is to provide small, robust tooling for HTTP servers, making
  it a great solution for single page applications, web sites, hybrids, or public
  HTTP APIs.

  Express does not force you to use any specific ORM or template engine. With support for over
  14 template engines via [Consolidate.js](https://github.com/tj/consolidate.js),
  you can quickly craft your perfect framework.

## Examples

  To view the examples, clone the Express repo and install the dependencies:

```bash
$ git clone git://github.com/strongloop/express.git --depth 1
$ cd express
$ npm install
```

  Then run whichever example you want:

```bash
$ node examples/content-negotiation
```

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```
$ npm install
$ npm test
```

## Docs
[mockjs](http://mockjs.com/)
[mongodb](https://www.mongodb.org/)
[express](http://expressjs.com/)
[angular](http://docs.angularjs.cn/guide)
[node](https://nodejs.org)

## License

  [MIT](LICENSE)
