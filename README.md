# backend_for_easyhotel
backend program for easyhotel with typescript

# 用户注册和登录操作

	•	Base URL：http://localhost:3000
	•	Content-Type：application/json
	•	认证方式：JWT Bearer Token
	•	Header：Authorization: Bearer <access_token>

## 认证 (AuthController)

### POST /auth/register
- 控制器：`AuthController.register`（`src/auth/auth.controller.ts`）
- 权限：公开
- Body Schema（`RegisterDto`）：
  - `username`: string
  - `password`: string，至少 6 位
  - `role`: `"MERCHANT"` 或 `"ADMIN"`

请求示例：
```json
{
  "username": "m1",
  "password": "123456",
  "role": "MERCHANT"
}
```

成功响应：
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

常见错误：
- 400 username already exists：用户名重复
- 400 DTO validation failed：缺字段、密码过短、role 非法值等

### POST /auth/login
- 控制器：`AuthController.login`
- 权限：公开
- Body Schema（`LoginDto`）：
  - `username`: string
  - `password`: string，至少 6 位

请求示例：
```json
{
  "username": "m1",
  "password": "123456"
}
```

成功响应：
```json
{
  "access_token": "..."
}
```

### GET /users/me
- 控制器：`UsersController.me`
- 权限：需 JWT（`@UseGuards(JwtAuthGuard)`）
- Header：`Authorization: Bearer <access_token>`

成功响应（`req.user`）：
```json
{
  "userId": 1,
  "username": "m1",
  "role": "MERCHANT"
}
```

## 商户酒店管理 (MerchantHotelsController)

> 以下接口均位于 `src/hotels/merchant-hotels.controller.ts`，需要携带商户身份的 JWT（`@UseGuards(JwtAuthGuard)`）。

### POST /api/merchant/hotels
- 方法：`create`
- 作用：创建酒店并可一次性附带房型
- Body Schema（`CreateHotelWithRoomsDto`）关键字段：
  - `nameCn`/`nameEn`、`address`、`starRating`、`openingDate`、`tags`、`cityCode`
  - `rooms`（可选）：`roomName`、`price`、`originalPrice`、`stock`

请求示例：
```json
{
  "nameCn": "易宿大酒店",
  "nameEn": "Yisu Grand Hotel",
  "address": "北京市朝阳区...",
  "starRating": 5,
  "openingDate": "2023-01-01",
  "tags": ["免费停车", "健身房"],
  "cityCode": "BJS",
  "rooms": [
    { "roomName": "豪华大床房", "price": "800.00", "originalPrice": "1000.00", "stock": 10 }
  ]
}
```

成功响应（`HotelsService.createForMerchant`）：
```json
{
  "id": 12,
  "merchantId": 3,
  "nameCn": "易宿大酒店",
  "status": 0,
  "auditReason": null,
  "rooms": [
    {
      "id": 21,
      "hotelId": 12,
      "roomName": "豪华大床房",
      "price": "800.00",
      "originalPrice": "1000.00",
      "stock": 10
    }
  ]
}
```

### PUT /api/merchant/hotels/:id
- 方法：`update`
- 作用：更新酒店基础信息
- Path Param：`id`（数字）
- Body Schema（`UpdateHotelDto`）可包含 `nameCn`、`address`、`starRating`、`tags`、`cityCode`、`openingDate` 等

请求示例：
```json
{
  "address": "上海市浦东新区...",
  "starRating": 4,
  "tags": ["免费停车"]
}
```

成功响应（Prisma `hotel.update` 完整对象）：
```json
{
  "id": 12,
  "merchantId": 3,
  "nameCn": "易宿大酒店",
  "address": "上海市浦东新区...",
  "starRating": 4,
  "cityCode": "SHA",
  "status": 0,
  "auditReason": null
}
```

### GET /api/merchant/hotels
- 方法：`listMine`
- 作用：查看当前商户名下酒店列表

成功响应（`HotelsService.listMine` 只返回部分字段）：
```json
[
  {
    "id": 12,
    "nameCn": "易宿大酒店",
    "cityCode": "BJS",
    "status": 0,
    "auditReason": null,
    "openingDate": "2023-01-01T00:00:00.000Z"
  },
  {
    "id": 15,
    "nameCn": "易宿外滩店",
    "cityCode": "SHA",
    "status": 1,
    "auditReason": null,
    "openingDate": null
  }
]
```


## 管理员审核

以下接口均需管理员账号登录，且 Header 必须带 `Authorization: Bearer <admin_token>`。

### GET /api/admin/hotels

查询全量酒店列表。支持以下可选查询参数：

- `status`：0 待审核 / 1 已发布 / 2 审核拒绝 / 3 下线
- `cityCode`：城市三字码，例如 `BJS`
- `keyword`：模糊匹配 `nameCn`、`nameEn`、`address`

示例：`/api/admin/hotels?status=0&cityCode=BJS&keyword=易宿`

响应示例：
```json
[
  {
    "id": 12,
    "nameCn": "易宿大酒店",
    "status": 0,
    "auditReason": null,
    "cityCode": "BJS",
    "merchant": {
      "id": 3,
      "username": "merchant_a"
    }
  }
]
```

### POST /api/admin/hotels/:id/approve

审核通过，状态置为 1（已发布），`auditReason` 会被清空。

### POST /api/admin/hotels/:id/reject

审核不通过，状态置为 2。Body 必须包含拒绝原因：

```json
{
  "auditReason": "营业执照信息不完整"
}
```

### POST /api/admin/hotels/:id/offline

将酒店状态改为 3（下线），用于临时下架。

### POST /api/admin/hotels/:id/restore

将状态从下线恢复为 1（已发布），`auditReason` 会被清空。
