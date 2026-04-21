---
title: user
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"


---

# user

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# 用户接口/账单接口

## POST 用户充值消费

POST /user/bill

> Body 请求参数

```json
{
  "type": -2147483648,
  "amount": 0,
  "remark": "string"
}
```

### 请求参数

| 名称     | 位置 | 类型    | 必选 | 说明                                             |
| -------- | ---- | ------- | ---- | ------------------------------------------------ |
| body     | body | object  | 是   | none                                             |
| » type   | body | integer | 是   | 流水类型：1-骑行消费，2-充值，3-退款，4-购买套餐 |
| » amount | body | number  | 是   | 变动金额（正数为进账，负数为支出）               |
| » remark | body | string  | 否   | 流水备注（如：购买套餐，账户充值，骑行消费）     |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称   | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ------ | ------- | ---- | ---- | ------ | ---- |
| » code | integer | true | none |        | none |
| » msg  | string  | true | none |        | none |
| » data | object  | true | none |        | none |

## GET 查询所有账单

GET /user/bills

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "bills": [
      {
        "id": 1,
        "type": -2147483648,
        "amount": 0,
        "remark": "string",
        "createTime": "CURRENT_TIMESTAMP"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称           | 类型                   | 必选  | 约束 | 中文名 | 说明                                             |
| -------------- | ---------------------- | ----- | ---- | ------ | ------------------------------------------------ |
| » code         | integer                | true  | none |        | none                                             |
| » msg          | string                 | true  | none |        | none                                             |
| » data         | object                 | true  | none |        | none                                             |
| »» bills       | [object]               | true  | none |        | none                                             |
| »»» id         | integer                | true  | none |        | 主键ID                                           |
| »»» type       | integer                | true  | none |        | 流水类型：1-骑行消费，2-充值，3-退款，4-购买套餐 |
| »»» amount     | number                 | true  | none |        | 变动金额（正数为进账，负数为支出）               |
| »»» remark     | string¦null            | false | none |        | 流水备注（如：骑行订单1002扣费）                 |
| »»» createTime | string(date-time)¦null | false | none |        | 创建时间                                         |

# 用户接口/账号接口

## POST 注册

POST /user/signin

> Body 请求参数

```json
{
  "email": "string",
  "password": "string",
  "verificationCode": "string"
}
```

### 请求参数

| 名称               | 位置 | 类型   | 必选 | 说明 |
| ------------------ | ---- | ------ | ---- | ---- |
| body               | body | object | 是   | none |
| » email            | body | string | 是   | none |
| » password         | body | string | 是   | none |
| » verificationCode | body | string | 是   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称   | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ------ | ------- | ---- | ---- | ------ | ---- |
| » code | integer | true | none |        | none |
| » msg  | string  | true | none |        | none |
| » data | object  | true | none |        | none |

## POST 登录

POST /user/login

> Body 请求参数

```json
{
  "email": "string",
  "password": "string"
}
```

### 请求参数

| 名称       | 位置 | 类型   | 必选 | 说明 |
| ---------- | ---- | ------ | ---- | ---- |
| body       | body | object | 是   | none |
| » email    | body | string | 是   | 邮箱 |
| » password | body | string | 是   | 密码 |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "id": 0,
    "username": "string",
    "token": "string",
    "email": "string"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称        | 类型    | 必选  | 约束 | 中文名 | 说明                   |
| ----------- | ------- | ----- | ---- | ------ | ---------------------- |
| » code      | integer | true  | none |        | none                   |
| » msg       | string  | false | none |        | none                   |
| » data      | object  | false | none |        | 用户登录返回的数据格式 |
| »» id       | integer | false | none |        | 主键值                 |
| »» username | string  | false | none |        | 姓名                   |
| »» token    | string  | false | none |        | jwt令牌                |
| »» email    | string  | false | none |        | 邮箱                   |

## POST 登出

POST /user/logout

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称   | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ------ | ------- | ---- | ---- | ------ | ---- |
| » code | integer | true | none |        | none |
| » msg  | string  | true | none |        | none |
| » data | object  | true | none |        | none |

## DELETE 注销

DELETE /user/delete

> Body 请求参数

```json
{
  "password": "string",
  "verificationCode": "string"
}
```

### 请求参数

| 名称               | 位置 | 类型   | 必选 | 说明 |
| ------------------ | ---- | ------ | ---- | ---- |
| body               | body | object | 是   | none |
| » password         | body | string | 是   | none |
| » verificationCode | body | string | 是   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称   | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ------ | ------- | ---- | ---- | ------ | ---- |
| » code | integer | true | none |        | none |
| » msg  | string  | true | none |        | none |
| » data | object  | true | none |        | none |

## GET 请求验证码

GET /user/verification

### 请求参数

| 名称  | 位置  | 类型   | 必选 | 说明 |
| ----- | ----- | ------ | ---- | ---- |
| email | query | string | 否   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称   | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ------ | ------- | ---- | ---- | ------ | ---- |
| » code | integer | true | none |        | none |
| » msg  | string  | true | none |        | none |
| » data | object  | true | none |        | none |

## POST 忘记密码

POST /user/password

> Body 请求参数

```json
{
  "verificationCode": "string",
  "newPassword": "string"
}
```

### 请求参数

| 名称               | 位置 | 类型   | 必选 | 说明 |
| ------------------ | ---- | ------ | ---- | ---- |
| body               | body | object | 是   | none |
| » verificationCode | body | string | 是   | none |
| » newPassword      | body | string | 是   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称   | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ------ | ------- | ---- | ---- | ------ | ---- |
| » code | integer | true | none |        | none |
| » msg  | string  | true | none |        | none |
| » data | object  | true | none |        | none |

# 用户接口/钱包接口

## GET 查询用户钱包

GET /user/wallet

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "balance": "0.00",
    "packages": [
      {
        "id": 1,
        "title": "string",
        "description": "string",
        "type": "1",
        "expireDate": "CURRENT_TIMESTAMP",
        "restDay": 0
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称            | 类型                   | 必选  | 约束 | 中文名 | 说明                         |
| --------------- | ---------------------- | ----- | ---- | ------ | ---------------------------- |
| » code          | integer                | true  | none |        | none                         |
| » msg           | string                 | true  | none |        | none                         |
| » data          | object                 | true  | none |        | none                         |
| »» balance      | number¦null            | false | none |        | 余额                         |
| »» packages     | [object]               | true  | none |        | none                         |
| »»» id          | integer                | true  | none |        | 主键ID                       |
| »»» title       | string                 | true  | none |        | 套餐标题                     |
| »»» description | string¦null            | false | none |        | 套餐描述                     |
| »»» type        | integer¦null           | false | none |        | 类型：1-月卡，2-季卡，3-年卡 |
| »»» expireDate  | string(date-time)¦null | false | none |        | 到期时间                     |
| »»» restDay     | integer                | true  | none |        | 剩余天数                     |

# 用户接口/历史行程接口

## GET 查询所有历史行程

GET /ride-history

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "history": [
      {
        "id": 1,
        "startTime": "2019-08-24T14:15:22Z",
        "orderStatus": "0",
        "payStatus": "0",
        "amount": "0.00",
        "totalKilometer": "0.00"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称               | 类型                   | 必选  | 约束 | 中文名 | 说明                                   |
| ------------------ | ---------------------- | ----- | ---- | ------ | -------------------------------------- |
| » code             | integer                | true  | none |        | none                                   |
| » msg              | string                 | true  | none |        | none                                   |
| » data             | object                 | true  | none |        | none                                   |
| »» history         | [object]               | true  | none |        | none                                   |
| »»» id             | integer                | true  | none |        | 主键RentOrder订单ID                    |
| »»» startTime      | string(date-time)¦null | false | none |        | 开始时间                               |
| »»» orderStatus    | integer¦null           | false | none |        | 订单状态：0-骑行中，1-待支付，2-已结束 |
| »»» payStatus      | integer¦null           | false | none |        | 支付状态：0-未支付，1-已支付           |
| »»» amount         | number¦null            | false | none |        | 金额                                   |
| »»» totalKilometer | number¦null            | false | none |        | 总里程                                 |

## POST 支付未支付订单

POST /unpaid-order

> Body 请求参数

```json
{
  "orderId": 1,
  "amount": "0.00"
}
```

### 请求参数

| 名称      | 位置 | 类型        | 必选 | 说明   |
| --------- | ---- | ----------- | ---- | ------ |
| body      | body | object      | 是   | none   |
| » orderId | body | integer     | 是   | 主键ID |
| » amount  | body | number¦null | 否   | 金额   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称   | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ------ | ------- | ---- | ---- | ------ | ---- |
| » code | integer | true | none |        | none |
| » msg  | string  | true | none |        | none |
| » data | object  | true | none |        | none |

# 用户接口/个人信息接口

## GET 查询个人信息

GET /user/info

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "username": "string",
    "email": "string",
    "totalKilometer": "string",
    "totalTime": "string"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称              | 类型    | 必选 | 约束 | 中文名 | 说明             |
| ----------------- | ------- | ---- | ---- | ------ | ---------------- |
| » code            | integer | true | none |        | none             |
| » msg             | string  | true | none |        | none             |
| » data            | object  | true | none |        | none             |
| »» username       | string  | true | none |        | none             |
| »» email          | string  | true | none |        | none             |
| »» totalKilometer | string  | true | none |        | 历史里程总和     |
| »» totalTime      | string  | true | none |        | 历史骑行时间总和 |

# 地图接口

## GET 查询车辆，禁停区，停放点

GET /map

查询附近车辆

### 请求参数

| 名称      | 位置  | 类型    | 必选 | 说明              |
| --------- | ----- | ------- | ---- | ----------------- |
| longitude | query | number  | 是   | none              |
| latitude  | query | number  | 是   | none              |
| scale     | query | integer | 否   | 地图缩放级别 3-20 |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "scooters": [
      {
        "id": 1,
        "code": "string",
        "rideStatus": "0",
        "faultStatus": 0,
        "battery": "100",
        "latitude": 0,
        "longitude": 0
      }
    ],
    "noParkingAreas": [
      {
        "id": 1,
        "polygon": "string",
        "status": "1",
        "center": "string"
      }
    ],
    "parkingPoints": [
      {
        "name": "string",
        "latitude": 0,
        "longitude": 0
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称              | 类型         | 必选  | 约束 | 中文名 | 说明                   |
| ----------------- | ------------ | ----- | ---- | ------ | ---------------------- |
| » code            | integer      | true  | none |        | none                   |
| » msg             | string       | false | none |        | none                   |
| » data            | object       | true  | none |        | none                   |
| »» scooters       | [object]     | true  | none |        | none                   |
| »»» id            | integer      | true  | none |        | scooter主键ID          |
| »»» code          | string       | true  | none |        | 车辆编码               |
| »»» rideStatus    | integer¦null | false | none |        | 状态：0-空闲，1-使用中 |
| »»» faultStatus   | integer      | true  | none |        | 0-正常 1-故障          |
| »»» battery       | integer¦null | false | none |        | 电量                   |
| »»» latitude      | number¦null  | false | none |        | 纬度                   |
| »»» longitude     | number¦null  | false | none |        | 经度                   |
| »» noParkingAreas | [object]     | true  | none |        | none                   |
| »»» id            | integer      | true  | none |        | 禁停区主键ID           |
| »»» polygon       | string¦null  | false | none |        | 禁停多边形范围坐标     |
| »»» status        | integer¦null | false | none |        | 状态：1-启用，0-禁用   |
| »»» center        | string       | true  | none |        | 禁停多边形中心点坐标   |
| »» parkingPoints  | [object]     | true  | none |        | none                   |
| »»» name          | string       | true  | none |        | none                   |
| »»» latitude      | number       | true  | none |        | none                   |
| »»» longitude     | number       | true  | none |        | none                   |

# 小车接口

## POST 解锁小车开始订单

POST /scooter/unlock

### 请求参数

| 名称 | 位置  | 类型   | 必选 | 说明 |
| ---- | ----- | ------ | ---- | ---- |
| code | query | string | 否   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "orderId": 0,
    "scooterId": 0
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称         | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ------------ | ------- | ---- | ---- | ------ | ---- |
| » code       | integer | true | none |        | none |
| » msg        | string  | true | none |        | none |
| » data       | object  | true | none |        | none |
| »» orderId   | integer | true | none |        | none |
| »» scooterId | integer | true | none |        | none |

## GET 扫码获取小车信息

GET /scooter

### 请求参数

| 名称 | 位置  | 类型   | 必选 | 说明 |
| ---- | ----- | ------ | ---- | ---- |
| code | query | string | 否   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "id": 1,
    "code": "string",
    "rideStatus": "0",
    "faultStatus": 0,
    "battery": "100",
    "latitude": 0,
    "longitude": 0
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称           | 类型         | 必选  | 约束 | 中文名 | 说明                   |
| -------------- | ------------ | ----- | ---- | ------ | ---------------------- |
| » code         | integer      | true  | none |        | none                   |
| » msg          | string       | true  | none |        | none                   |
| » data         | object       | true  | none |        | none                   |
| »» id          | integer      | true  | none |        | 主键ID                 |
| »» code        | string       | true  | none |        | 车辆编码               |
| »» rideStatus  | integer¦null | false | none |        | 状态：0-空闲，1-使用中 |
| »» faultStatus | integer      | true  | none |        | 0-正常 1-故障          |
| »» battery     | integer¦null | false | none |        | 电量                   |
| »» latitude    | number¦null  | false | none |        | 纬度                   |
| »» longitude   | number¦null  | false | none |        | 经度                   |

## POST 锁上小车结束订单

POST /scooter/lock

> Body 请求参数

```json
{
  "orderId": -2147483648,
  "startTime": "2019-08-24T14:15:22Z",
  "endTime": "2019-08-24T14:15:22Z",
  "amount": "0.00",
  "totalKilometer": "0.00",
  "code": 1,
  "battery": "100",
  "latitude": 0,
  "longitude": 0
}
```

### 请求参数

| 名称             | 位置 | 类型                   | 必选 | 说明       |
| ---------------- | ---- | ---------------------- | ---- | ---------- |
| body             | body | object                 | 是   | none       |
| » orderId        | body | integer                | 是   | 订单ID     |
| » startTime      | body | string(date-time)¦null | 否   | 开始时间   |
| » endTime        | body | string(date-time)¦null | 否   | 结束时间   |
| » amount         | body | number¦null            | 否   | 金额       |
| » totalKilometer | body | number¦null            | 否   | 总里程     |
| » code           | body | integer                | 是   | 车辆主键ID |
| » battery        | body | integer¦null           | 否   | 电量       |
| » latitude       | body | number¦null            | 否   | 纬度       |
| » longitude      | body | number¦null            | 否   | 经度       |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "id": 1,
    "startTime": "2019-08-24T14:15:22Z",
    "payStatus": "0",
    "amount": "0.00",
    "totalTime": "string",
    "totalKilometer": "0.00"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称              | 类型                   | 必选  | 约束 | 中文名 | 说明                         |
| ----------------- | ---------------------- | ----- | ---- | ------ | ---------------------------- |
| » code            | integer                | true  | none |        | none                         |
| » msg             | string                 | true  | none |        | none                         |
| » data            | object                 | true  | none |        | none                         |
| »» id             | integer                | true  | none |        | 主键ID                       |
| »» startTime      | string(date-time)¦null | false | none |        | 开始时间                     |
| »» payStatus      | integer¦null           | false | none |        | 支付状态：0-未支付，1-已支付 |
| »» amount         | number¦null            | false | none |        | 金额                         |
| »» totalTime      | string                 | true  | none |        | 总时长（00：10：10）十分十秒 |
| »» totalKilometer | number¦null            | false | none |        | 总里程                       |

# 故障接口

## GET 查询所有故障上报记录

GET /faults

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "faults": [
      {
        "id": 1,
        "code": -2147483648,
        "description": "string",
        "createTime": "CURRENT_TIMESTAMP"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称            | 类型                   | 必选  | 约束 | 中文名 | 说明        |
| --------------- | ---------------------- | ----- | ---- | ------ | ----------- |
| » code          | integer                | true  | none |        | none        |
| » msg           | string                 | true  | none |        | none        |
| » data          | object                 | true  | none |        | none        |
| »» faults       | [object]               | true  | none |        | none        |
| »»» id          | integer                | true  | none |        | fault主键ID |
| »»» code        | integer                | true  | none |        | 车辆Code    |
| »»» description | string¦null            | false | none |        | 故障描述    |
| »»» createTime  | string(date-time)¦null | false | none |        | 创建时间    |

## POST 故障上报

POST /fault

> Body 请求参数

```yaml
image: ""
scooterId: 0
description: ""

```

### 请求参数

| 名称          | 位置 | 类型           | 必选 | 说明 |
| ------------- | ---- | -------------- | ---- | ---- |
| body          | body | object         | 是   | none |
| » image       | body | string(binary) | 否   | none |
| » scooterId   | body | integer        | 否   | none |
| » description | body | string         | 否   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "fault_status": 0,
    "orderId": "string"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称            | 类型    | 必选 | 约束 | 中文名 | 说明                  |
| --------------- | ------- | ---- | ---- | ------ | --------------------- |
| » code          | integer | true | none |        | none                  |
| » msg           | string  | true | none |        | none                  |
| » data          | object  | true | none |        | none                  |
| »» fault_status | integer | true | none |        | 状态：0-正常，1-故障  |
| »» orderId      | string  | true | none |        | 如果使用中，传orderId |

# 套餐接口

## GET 查询所有套餐

GET /subscription

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "packages": [
      {
        "id": 1,
        "title": "string",
        "description": "string",
        "price": 0,
        "type": "1"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称            | 类型         | 必选  | 约束 | 中文名 | 说明                         |
| --------------- | ------------ | ----- | ---- | ------ | ---------------------------- |
| » code          | integer      | true  | none |        | none                         |
| » msg           | string       | true  | none |        | none                         |
| » data          | object       | true  | none |        | none                         |
| »» packages     | [object]     | true  | none |        | none                         |
| »»» id          | integer      | true  | none |        | 主键ID                       |
| »»» title       | string       | true  | none |        | 套餐标题                     |
| »»» description | string¦null  | false | none |        | 套餐描述                     |
| »»» price       | number       | true  | none |        | 价格                         |
| »»» type        | integer¦null | false | none |        | 类型：1-月卡，2-季卡，3-年卡 |

