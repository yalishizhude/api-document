# [中文文档](https://github.com/yalishizhude/api-document/blob/master/readme_zh.md)

# HTTP API server

API document manage&http request test server.

## Installation

1. Please make sure that you have installed [mongodb](https://www.mongodb.org/)
2. [Node.js](https://nodejs.org) also needs to be installed
3. Install the project
```
$ git clone https://github.com/yalishizhude/api-document.git
```
4. Install bower
```
$ npm install bower
```
5. install modules
```
$ npm install
$ bower install
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

<!--
1.增加历史接口归档；
2.接口列表排序；
3.前置登录接口（支持token方式登陆，暂不支持session）；
4.登陆方式改为cookie；
5.优化路由逻辑；
 -->


<!--
1. 自动刷新mock服务器bug修复;
2. 参数说明按表格切分
3. 参数校验
4. 路由排序加载解决重载覆盖问题
5. 默认按添加排序
6. 操作手册
7. 接口列表查看页面优化
8. 富文本编辑器
 -->
