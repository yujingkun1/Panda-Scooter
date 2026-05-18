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

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» email|body|string| 是 |none|
|» password|body|string| 是 |none|
|» verificationCode|body|string| 是 |none|
|» name|body|string| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

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

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» email|body|string| 是 |none|
|» password|body|string| 是 |none|

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

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|false|none||none|
|» data|object|false|none||none|
|»» id|integer|false|none||none|
|»» name|string|true|none||真实姓名|
|»» token|string|false|none||none|
|»» email|string|true|none||none|

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

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|
|» data|object|true|none||none|

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

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|
|» data|object|true|none||none|

## GET 请求验证码

GET /user/verification

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 修改密码

POST /user/password

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

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

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|
|» data|object|true|none||none|
|»» name|string|true|none||姓名|
|»» email|string¦null|false|none||邮箱|
|»» areaName|string|true|none||辖区名称|
|»» todayDispatchedNum|string|true|none||今日调度数量|

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
        "status": 0,
        "battery": 0
      }
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|
|» data|object|true|none||none|
|»» history|[object]|true|none||none|
|»»» id|integer|true|none||none|
|»»» scooterCode|string|true|none||none|
|»»» startTime|string(date-time)|true|none||none|
|»»» endTime|string(date-time)|true|none||none|
|»»» rideStatus|integer|true|none||none|
|»»» faultStatus|integer|true|none||none|
|»»» status|integer|true|none||0-调度中；1-已完成|
|»»» battery|integer|true|none||none|

# 地图接口

## GET 查询辖区，车辆，禁停区，停放点

GET /map

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|latitude|query|number| 是 |none|
|longitude|query|number| 是 |none|
|scale|query|integer| 是 |地图尺寸3-20|

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

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|
|» data|object|true|none||none|
|»» scooters|[object]|true|none||none|
|»»» id|integer|true|none||车辆主键ID|
|»»» code|string|true|none||车辆编码|
|»»» ride_status|integer¦null|false|none||状态：0-空闲，1-使用中，2-维修中，3-调度中|
|»»» fault_status|integer|true|none||0-正常 1-故障|
|»»» battery|integer¦null|false|none||电量|
|»»» latitude|number¦null|false|none||纬度|
|»»» longitude|number¦null|false|none||经度|
|»» noParkingAreas|[object]|true|none||none|
|»»» id|integer|true|none||主键ID|
|»»» name|string¦null|false|none||禁停区名称|
|»»» polygon|string¦null|false|none||禁停多边形范围坐标|
|»»» status|integer¦null|false|none||状态：1-启用，0-禁用|
|»» area|object|true|none||none|
|»»» id|integer|true|none||主键ID|
|»»» name|string|true|none||区域名称|
|»»» polygon|string¦null|false|none||多边形范围坐标|
|»» parkingPoints|[object]|true|none||none|
|»»» latitude|number|true|none||none|
|»»» longitude|number|true|none||none|

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

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» code|body|string| 是 |车辆编码|

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

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|
|» data|object|true|none||none|
|»» scooterId|integer|true|none||none|

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

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» code|body|string| 是 |none|
|» battery|body|integer| 是 |none|
|» latitude|body|number| 是 |none|
|» longitude|body|number| 是 |none|

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

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|
|» data|object|true|none||none|

## GET 扫码获取小车信息

GET /scooter/info

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|code|query|string| 否 |none|

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

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» msg|string|true|none||none|
|» data|object|true|none||none|
|»» id|integer|true|none||主键ID|
|»» code|string|true|none||车辆编码|
|»» ride_status|integer¦null|false|none||状态：0-空闲，1-使用中|
|»» fault_status|integer|true|none||0-正常 1-故障|
|»» battery|integer¦null|false|none||电量|
|»» latitude|number¦null|false|none||纬度|
|»» longitude|number¦null|false|none||经度|

# 数据模型

<h2 id="tocS_Result">Result</h2>

<a id="schemaresult"></a>
<a id="schema_Result"></a>
<a id="tocSresult"></a>
<a id="tocsresult"></a>

```json
{
  "code": 0,
  "msg": "string",
  "data": {}
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|true|none||none|
|msg|string|true|none||none|
|data|object|true|none||none|

<h2 id="tocS_Area">Area</h2>

<a id="schemaarea"></a>
<a id="schema_Area"></a>
<a id="tocSarea"></a>
<a id="tocsarea"></a>

```json
{
  "id": 1,
  "name": "string",
  "polygon": "string",
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|name|string|true|none||区域名称|
|polygon|string¦null|false|none||多边形范围坐标|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_Dispatcher">Dispatcher</h2>

<a id="schemadispatcher"></a>
<a id="schema_Dispatcher"></a>
<a id="tocSdispatcher"></a>
<a id="tocsdispatcher"></a>

```json
{
  "id": 1,
  "name": "string",
  "password": "string",
  "email": "string",
  "areaId": -2147483648,
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|name|string|true|none||姓名|
|password|string|true|none||密码|
|email|string¦null|false|none||邮箱|
|areaId|integer¦null|false|none||所属区域ID|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_FaultReport">FaultReport</h2>

<a id="schemafaultreport"></a>
<a id="schema_FaultReport"></a>
<a id="tocSfaultreport"></a>
<a id="tocsfaultreport"></a>

```json
{
  "id": 1,
  "userId": -2147483648,
  "scooterId": -2147483648,
  "description": "string",
  "imageUrl": "string",
  "status": "0",
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|userId|integer|true|none||用户ID|
|scooterId|integer|true|none||车辆ID|
|description|string¦null|false|none||故障描述|
|imageUrl|string¦null|false|none||图片链接|
|status|integer¦null|false|none||处理状态：0-未处理，1-已处理|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_NoParkingArea">NoParkingArea</h2>

<a id="schemanoparkingarea"></a>
<a id="schema_NoParkingArea"></a>
<a id="tocSnoparkingarea"></a>
<a id="tocsnoparkingarea"></a>

```json
{
  "id": 1,
  "name": "string",
  "polygon": "string",
  "status": "1",
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|name|string¦null|false|none||禁停区名称|
|polygon|string¦null|false|none||禁停多边形范围坐标|
|status|integer¦null|false|none||状态：1-启用，0-禁用|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_PackageOrder">PackageOrder</h2>

<a id="schemapackageorder"></a>
<a id="schema_PackageOrder"></a>
<a id="tocSpackageorder"></a>
<a id="tocspackageorder"></a>

```json
{
  "id": 1,
  "userId": -2147483648,
  "packageId": -2147483648,
  "price": 0,
  "orderStatus": "0",
  "payStatus": "0",
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|userId|integer|true|none||用户ID|
|packageId|integer|true|none||套餐ID|
|price|number|true|none||购买价格|
|orderStatus|integer¦null|false|none||订单状态：0-待支付，1-已结束|
|payStatus|integer¦null|false|none||支付状态：0-未付，1-已付|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_PricingRule">PricingRule</h2>

<a id="schemapricingrule"></a>
<a id="schema_PricingRule"></a>
<a id="tocSpricingrule"></a>
<a id="tocspricingrule"></a>

```json
{
  "id": 1,
  "pricePerMin": "0.00",
  "basePrice": "0.00",
  "billingInterval": "30",
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|pricePerMin|number¦null|false|none||每分钟单价|
|basePrice|number¦null|false|none||起步价|
|billingInterval|integer¦null|false|none||计费间隔（分钟）|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_RentalOrder">RentalOrder</h2>

<a id="schemarentalorder"></a>
<a id="schema_RentalOrder"></a>
<a id="tocSrentalorder"></a>
<a id="tocsrentalorder"></a>

```json
{
  "id": 1,
  "userId": -2147483648,
  "scooterId": -2147483648,
  "startTime": "2019-08-24T14:15:22Z",
  "endTime": "2019-08-24T14:15:22Z",
  "totalTime": "0",
  "orderStatus": "0",
  "payStatus": "0",
  "amount": "0.00",
  "totalKilometer": "0.00",
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|userId|integer|true|none||用户ID|
|scooterId|integer|true|none||车辆ID|
|startTime|string(date-time)¦null|false|none||开始时间|
|endTime|string(date-time)¦null|false|none||结束时间|
|totalTime|integer¦null|false|none||骑行总时长（单位：分钟）|
|orderStatus|integer¦null|false|none||订单状态：0-骑行中，1-待支付，2-已结束|
|payStatus|integer¦null|false|none||支付状态：0-未支付，1-已支付|
|amount|number¦null|false|none||金额|
|totalKilometer|number¦null|false|none||总里程|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_Scooter">Scooter</h2>

<a id="schemascooter"></a>
<a id="schema_Scooter"></a>
<a id="tocSscooter"></a>
<a id="tocsscooter"></a>

```json
{
  "id": 1,
  "code": "string",
  "ride_status": "0",
  "fault_status": 0,
  "battery": "100",
  "latitude": 0,
  "longitude": 0,
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|code|string|true|none||车辆编码|
|ride_status|integer¦null|false|none||状态：0-空闲，1-使用中|
|fault_status|integer|true|none||0-正常 1-故障|
|battery|integer¦null|false|none||电量|
|latitude|number¦null|false|none||纬度|
|longitude|number¦null|false|none||经度|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_SubscriptionPackage">SubscriptionPackage</h2>

<a id="schemasubscriptionpackage"></a>
<a id="schema_SubscriptionPackage"></a>
<a id="tocSsubscriptionpackage"></a>
<a id="tocssubscriptionpackage"></a>

```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "price": 0,
  "type": "1",
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|title|string|true|none||套餐标题|
|description|string¦null|false|none||套餐描述|
|price|number|true|none||价格|
|type|integer¦null|false|none||类型：1-月卡，2-季卡，3-年卡|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_User">User</h2>

<a id="schemauser"></a>
<a id="schema_User"></a>
<a id="tocSuser"></a>
<a id="tocsuser"></a>

```json
{
  "id": 1,
  "username": "string",
  "password": "string",
  "email": "string",
  "createTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|username|string|true|none||用户名|
|password|string|true|none||密码|
|email|string¦null|false|none||电子邮箱|
|createTime|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_UserBill">UserBill</h2>

<a id="schemauserbill"></a>
<a id="schema_UserBill"></a>
<a id="tocSuserbill"></a>
<a id="tocsuserbill"></a>

```json
{
  "id": 1,
  "userId": -2147483648,
  "type": -2147483648,
  "amount": 0,
  "balanceAfter": 0,
  "orderId": -2147483648,
  "remark": "string",
  "create_time": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|userId|integer|true|none||用户ID|
|type|integer|true|none||流水类型：1-骑行消费，2-充值，3-退款，4-购买套餐|
|amount|number|true|none||变动金额（正数为进账，负数为支出）|
|balanceAfter|number|true|none||变动后账户余额（用于对账）|
|orderId|integer¦null|false|none||业务订单ID|
|remark|string¦null|false|none||流水备注（如：骑行订单1002扣费）|
|create_time|string(date-time)¦null|false|none||创建时间|

<h2 id="tocS_UserWallet">UserWallet</h2>

<a id="schemauserwallet"></a>
<a id="schema_UserWallet"></a>
<a id="tocSuserwallet"></a>
<a id="tocsuserwallet"></a>

```json
{
  "id": 1,
  "userId": -2147483648,
  "balance": "0.00",
  "updateTime": "CURRENT_TIMESTAMP"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none||主键ID|
|userId|integer|true|none||用户ID|
|balance|number¦null|false|none||余额|
|updateTime|string(date-time)¦null|false|none||更新时间|

