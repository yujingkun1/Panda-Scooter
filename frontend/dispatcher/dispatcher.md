---
title: dispatcher
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

# dispatcher

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# 调度员接口/账号接口

## POST 注册

POST /user/signin

> Body 请求参数

```json
{
  "email": "string",
  "password": "string",
  "verificationCode": "string",
  "name": "string"
}
```

### 请求参数

| 名称               | 位置 | 类型   | 必选 | 说明 |
| ------------------ | ---- | ------ | ---- | ---- |
| body               | body | object | 是   | none |
| » email            | body | string | 是   | none |
| » password         | body | string | 是   | none |
| » verificationCode | body | string | 是   | none |
| » name             | body | string | 是   | none |

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

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
| » email    | body | string | 是   | none |
| » password | body | string | 是   | none |

> 返回示例

> 200 Response

```json
{
  "code": 1,
  "msg": "",
  "data": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2NjU4NDk0MywianRpIjoiNTJlODA5MjctMzBiZS00OGM4LTkzZGUtMzQxZTcwYzhmMmJmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjE0OCIsIm5iZiI6MTc2NjU4NDk0MywiY3NyZiI6IjQ1OTVkYzU1LWZjMmQtNGNlNC04MGQ1LWEyODI0YzZhMmQ2ZiIsImV4cCI6MTc2NzE4OTc0MywidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AcXEuY29tIn0.vBSXuDTg2w2umqlWZgPfCYZYYO71CdwHNqtJ9JCZoMs"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称     | 类型    | 必选  | 约束 | 中文名 | 说明     |
| -------- | ------- | ----- | ---- | ------ | -------- |
| » code   | integer | true  | none |        | none     |
| » msg    | string  | false | none |        | none     |
| » data   | object  | false | none |        | none     |
| »» id    | integer | false | none |        | none     |
| »» name  | string  | true  | none |        | 真实姓名 |
| »» token | string  | false | none |        | none     |
| »» email | string  | true  | none |        | none     |

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

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

## POST 修改密码

POST /user/password

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

# 调度员接口/个人信息接口

## GET 查询个人信息

GET /user/info

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "name": "string",
    "email": "string",
    "areaName": "string",
    "todayDispatchedNum": "string"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明 | 数据模型 |
| ------ | ------------------------------------------------------- | ---- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | none | Inline   |

### 返回数据结构

状态码 **200**

| 名称                  | 类型        | 必选  | 约束 | 中文名 | 说明         |
| --------------------- | ----------- | ----- | ---- | ------ | ------------ |
| » code                | integer     | true  | none |        | none         |
| » msg                 | string      | true  | none |        | none         |
| » data                | object      | true  | none |        | none         |
| »» name               | string      | true  | none |        | 姓名         |
| »» email              | string¦null | false | none |        | 邮箱         |
| »» areaName           | string      | true  | none |        | 辖区名称     |
| »» todayDispatchedNum | string      | true  | none |        | 今日调度数量 |

# 调度员接口/调度历史接口

## GET 查询调度历史

GET /user/dispatch-history

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
    "history": [
      {
        "id": 0,
        "scooterCode": "string",
        "startTime": "2019-08-24T14:15:22Z",
        "endTime": "2019-08-24T14:15:22Z",
        "rideStatus": 0,
        "faultStatus": 0,
        "battery": 0
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

| 名称            | 类型              | 必选 | 约束 | 中文名 | 说明 |
| --------------- | ----------------- | ---- | ---- | ------ | ---- |
| » code          | integer           | true | none |        | none |
| » msg           | string            | true | none |        | none |
| » data          | object            | true | none |        | none |
| »» history      | [object]          | true | none |        | none |
| »»» id          | integer           | true | none |        | none |
| »»» scooterCode | string            | true | none |        | none |
| »»» startTime   | string(date-time) | true | none |        | none |
| »»» endTime     | string(date-time) | true | none |        | none |
| »»» rideStatus  | integer           | true | none |        | none |
| »»» faultStatus | integer           | true | none |        | none |
| »»» battery     | integer           | true | none |        | none |

# 地图接口

## GET 查询辖区，车辆，禁停区，停放点

GET /map

### 请求参数

| 名称      | 位置  | 类型    | 必选 | 说明         |
| --------- | ----- | ------- | ---- | ------------ |
| latitude  | query | number  | 是   | none         |
| longitude | query | number  | 是   | none         |
| scale     | query | integer | 是   | 地图尺寸3-20 |

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
        "ride_status": "0",
        "fault_status": 0,
        "battery": "100",
        "latitude": 0,
        "longitude": 0
      }
    ],
    "noParkingAreas": [
      {
        "id": 1,
        "name": "string",
        "polygon": "string",
        "status": "1"
      }
    ],
    "area": {
      "id": 1,
      "name": "string",
      "polygon": "string"
    },
    "parkingPoints": [
      {
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

| 名称              | 类型         | 必选  | 约束 | 中文名 | 说明                                       |
| ----------------- | ------------ | ----- | ---- | ------ | ------------------------------------------ |
| » code            | integer      | true  | none |        | none                                       |
| » msg             | string       | true  | none |        | none                                       |
| » data            | object       | true  | none |        | none                                       |
| »» scooters       | [object]     | true  | none |        | none                                       |
| »»» id            | integer      | true  | none |        | 车辆主键ID                                 |
| »»» code          | string       | true  | none |        | 车辆编码                                   |
| »»» ride_status   | integer¦null | false | none |        | 状态：0-空闲，1-使用中，2-维修中，3-调度中 |
| »»» fault_status  | integer      | true  | none |        | 0-正常 1-故障                              |
| »»» battery       | integer¦null | false | none |        | 电量                                       |
| »»» latitude      | number¦null  | false | none |        | 纬度                                       |
| »»» longitude     | number¦null  | false | none |        | 经度                                       |
| »» noParkingAreas | [object]     | true  | none |        | none                                       |
| »»» id            | integer      | true  | none |        | 主键ID                                     |
| »»» name          | string¦null  | false | none |        | 禁停区名称                                 |
| »»» polygon       | string¦null  | false | none |        | 禁停多边形范围坐标                         |
| »»» status        | integer¦null | false | none |        | 状态：1-启用，0-禁用                       |
| »» area           | object       | true  | none |        | none                                       |
| »»» id            | integer      | true  | none |        | 主键ID                                     |
| »»» name          | string       | true  | none |        | 区域名称                                   |
| »»» polygon       | string¦null  | false | none |        | 多边形范围坐标                             |
| »» parkingPoints  | [object]     | true  | none |        | none                                       |
| »»» latitude      | number       | true  | none |        | none                                       |
| »»» longitude     | number       | true  | none |        | none                                       |

# 小车接口

## POST 开锁调度

POST /scooter/unlock

> Body 请求参数

```json
{
  "code": "string"
}
```

### 请求参数

| 名称   | 位置 | 类型   | 必选 | 说明     |
| ------ | ---- | ------ | ---- | -------- |
| body   | body | object | 是   | none     |
| » code | body | string | 是   | 车辆编码 |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "string",
  "data": {
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
| »» scooterId | integer | true | none |        | none |

## POST 关锁投放

POST /scooter/lock

> Body 请求参数

```json
{
  "code": "string",
  "battery": 0,
  "latitude": 0,
  "longitude": 0
}
```

### 请求参数

| 名称        | 位置 | 类型    | 必选 | 说明 |
| ----------- | ---- | ------- | ---- | ---- |
| body        | body | object  | 是   | none |
| » code      | body | string  | 是   | none |
| » battery   | body | integer | 是   | none |
| » latitude  | body | number  | 是   | none |
| » longitude | body | number  | 是   | none |

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

## GET 扫码获取小车信息

GET /scooter/info

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
    "ride_status": "0",
    "fault_status": 0,
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

| 名称            | 类型         | 必选  | 约束 | 中文名 | 说明                   |
| --------------- | ------------ | ----- | ---- | ------ | ---------------------- |
| » code          | integer      | true  | none |        | none                   |
| » msg           | string       | true  | none |        | none                   |
| » data          | object       | true  | none |        | none                   |
| »» id           | integer      | true  | none |        | 主键ID                 |
| »» code         | string       | true  | none |        | 车辆编码               |
| »» ride_status  | integer¦null | false | none |        | 状态：0-空闲，1-使用中 |
| »» fault_status | integer      | true  | none |        | 0-正常 1-故障          |
| »» battery      | integer¦null | false | none |        | 电量                   |
| »» latitude     | number¦null  | false | none |        | 纬度                   |
| »» longitude    | number¦null  | false | none |        | 经度                   |

