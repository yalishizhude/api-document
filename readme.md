# [中文文档](https://github.com/yalishizhude/api-document/blob/master/readme_zh.md)

# HTTP API server

API document manage&http request test server.

## Installation

1. Please make sure that you have installed [mongodb](https://www.mongodb.org/)
2. [Node.js](https://nodejs.org) also needs to be installed
3. Install the project
```
$ git clone https://github.com/yalishizhude/api-server.git
```
or
```
$ npm install api-document-server
```

## Features
* Based on MEAN(Mongodb,Express,Angular,Node) stack.
* Support edit&view api document online.
* Support simple authority management.
* Provide a mock server responding data to front-end without database and back-end server([api-mock](https://github.com/yalishizhude/api-mock)must be installed). 
* Send request to back-end and display response.
* According to REST specification.

## Quick Start

1. Start your mongodb
2. Install modules

```
$ npm install
```

3. Start the server

```
$ npm start
```

## Notice

* Maybe you need to config the mongodb's params in **routes/config.js** if you changed mongodb's default connection.
* All **delete** operation are **double left click**.

## Tests

  To run the tests, first install the dependencies, then run `npm test`:

```
$ npm install
$ npm test
```

## Docs

mockjs (http://mockjs.com/)

mongodb (https://www.mongodb.org/)

express (http://expressjs.com/)

angular (http://docs.angularjs.cn/guide)

node (https://nodejs.org)

## License

  [MIT](LICENSE)
