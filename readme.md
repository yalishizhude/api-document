# [中文文档](https://github.com/yalishizhude/api-document/blob/master/readme_zh.md)

**Your star would encourage me to improve this project insistently and I really appreciate it.**

![demo](/demo.gif)

# HTTP API document server

API document manage&http request test server.

## Installation

1.Please make sure that you have installed [mongodb](https://www.mongodb.org/)<br>
2.[Node.js](https://nodejs.org) also needs to be installed<br>
3.Install the project
```
$ git clone https://github.com/yalishizhude/api-document.git
```
4.Install bower
```
$ npm install bower
```
5.install modules<br>
```
$ npm install
$ bower install
```

## Features
* Support edit&view api document online.
* Support simple authority management.
* Provide a mock server responding data to front-end without database and back-end server([api-mock](https://github.com/yalishizhude/api-mock)must be installed).
* Send request to back-end and mark status of the interface development.
* Support JSON Schema validation to verify request/response params.

## Quick Start

1.Start your mongodb<br>
2.Install modules

```
$ npm install
```

3.Start the server

```
$ npm start
```

## Notice

* Maybe you need to config the mongodb's params in **routes/config.js** if you changed mongodb's default connection.
* All **delete** operation are **double left click**.
* default user: **admin/admin**


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
* 自动刷新mock服务器bug修复;
* 默认按添加排序;
* 参数说明和校验（json schema）;
* 操作手册（优化操作，添加提示）
* 请求响应时间
 -->
