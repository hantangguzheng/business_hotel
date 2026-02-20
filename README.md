# backend_for_easyhotel

backend program for easyhotel with typescript

# 用户注册和登录操作

    •	Base URL：http://localhost:3000
    •	Content-Type：application/json
    •	认证方式：JWT Bearer Token
    •	Header：Authorization: Bearer <access_token>

## 酒店与房型查询 API

以下查询接口均可匿名访问；仅当需要「我的酒店」「创建/修改」等写操作时才需要携带 `Authorization: Bearer <token>`。

### 1. GET /hotels/search / POST /hotels/search

- 控制器：`HotelsController.search` / `HotelsController.searchWithBody` → `HotelsService.search`
- 作用：综合酒店字段、房型标签、可用库存、经纬度排序等条件，分页返回酒店列表。
- **GET 版本**：通过 query string 传参，适合简单筛选（例如 `?keyword=布丁&page=1&pageSize=10`）。
- **POST 版本**：通过 JSON Body 传入 `SearchHotelsDto`，方便包含嵌套的 `room.tags.*`、`room.facilities.*` 等结构。
- 请求字段与含义：

| 字段                    | 类型                               | 说明                                                                                            |
| ----------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `keyword`               | string?                            | 模糊匹配 `nameCn`                                                                               |
| `cityCode`              | string?                            | 城市三字码精确匹配（如 `BJS`）                                                                  |
| `minPrice` / `maxPrice` | number?                            | 起步价区间，单位与 `currency` 一致                                                              |
| `minStar` / `maxStar`   | number?                            | 星级区间（1~5）                                                                                 |
| `minScore`              | number?                            | 最小评分                                                                                        |
| `tags`                  | string[]?                          | 设施/亮点标签，后台通过 `JSON_CONTAINS` 匹配                                                    |
| `userLat` / `userLng`   | number?                            | 传入后可计算距离排序                                                                            |
| `sortBy`                | `'distance' \| 'price' \| 'score'` | 默认 distance（若含经纬度），否则 price                                                         |
| `page` / `pageSize`     | number?                            | 默认 `1` / `20`，最大 `200`                                                                     |
| `room.tags`             | 同 `RoomTagFiltersDto`             | 过滤房型：`areaTitles`、`bedTitles`、`window`（有/无）、`smoke`（可吸烟/禁烟）、`wifi`（有/无） |
| `room.facilities`       | 同 `RoomFacilityFiltersDto`        | 每项为字符串数组，使用 `JSON_CONTAINS` 逐项匹配                                                 |
| `checkIn` / `checkOut`  | string? (YYYY-MM-DD)               | 搭配 `roomsNeeded`、`peopleNeeded` 触发库存贪心计算；`checkOut` 不包含当日                      |
| `roomsNeeded`           | number?                            | 需要的房间数（≥1）                                                                              |
| `peopleNeeded`          | number?                            | 需要容纳的人数（≥1）                                                                            |

- 返回结构：

```jsonc
{
  "total": 128,
  "data": [
    {
      "id": 12,
      "merchantId": 3,
      "nameCn": "易宿大酒店",
      "nameEn": "Yisu Grand Hotel",
      "imageUrls": ["https://.../main.jpg"],
      "shortTags": ["WIFI", "GYM"],
      "starRating": 5,
      "score": 4.7,
      "totalReviews": 238,
      "price": 688,
      "crossLinePrice": 799,
      "currency": "CNY",
      "latitude": 39.9042,
      "longitude": 116.4074,
      "address": "北京市朝阳区...",
      "cityCode": "BJS",
      "openingDate": "2023-01-01T00:00:00.000Z",
      "status": 1,
      "distance": 1530.22,
    },
  ],
}
```

以上对象为 `HotelListItemDto`，涵盖酒店卡片所需的基本展示字段。

### 2. GET /hotels/:id/detail?checkIn=2026-02-15&checkOut=2026-02-17

- 控制器：`HotelsController.detail`
- Query DTO：`HotelDetailQueryDto`（必须提供 `checkIn`、`checkOut`，格式 `YYYY-MM-DD`）
- 作用：查单个酒店详情并返回在指定日期范围内各房型的最小可售库存。
- 返回 `HotelDetailDto`，内部包含 `rooms: RoomListItemDto[]`：

```jsonc
{
  "id": 12,
  "nameCn": "易宿大酒店",
  "nameEn": "Yisu Grand Hotel",
  "imageUrls": ["https://.../main.jpg"],
  "starRating": 5,
  "score": 4.7,
  "totalReviews": 238,
  "price": 688,
  "currency": "CNY",
  "shortTags": ["WIFI", "GYM"],
  "address": "北京市朝阳区...",
  "cityCode": "BJS",
  "openingDate": "2023-01-01T00:00:00.000Z",
  "rooms": [
    {
      "id": 101,
      "hotelId": 12,
      "name": "豪华大床房",
      "areaTitle": "35-50",
      "bedTitle": "双人床",
      "windowTitle": "有",
      "smokeTitle": "禁烟",
      "wifiInfo": "有",
      "pictureUrl": "https://.../room101.jpg",
      "price": 688,
      "availableCount": 4,
    },
  ],
}
```

`availableCount` 为所选日期闭区间（不含 `checkOut` 当天）内库存最小值。

### 3. POST /rooms/search

- 控制器：`RoomsController.search`
- Body DTO：`SearchRoomsDto`

| 一级字段               | 类型                                          | 说明                                                                                |
| ---------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `hotelId`              | number                                        | 必填，只检索某酒店内部房型                                                          |
| `tags.areaTitles`      | string[]? (`"小于35"`, `"35-50"`, `"50以上"`) | 对应面积段                                                                          |
| `tags.bedTitles`       | string[]? (`"单人床"`, `"双人床"`...)         | 床型                                                                                |
| `tags.window`          | `"有"` \| `"无"`                              | 采光                                                                                |
| `tags.smoke`           | `"可吸烟"` \| `"禁烟"`                        | 吸烟政策                                                                            |
| `tags.wifi`            | `"有"` \| `"无"`                              | wifi 信息                                                                           |
| `facilities.*`         | string[]?                                     | 各分组设施（cleaning/bathing/.../view），使用 `hasEvery`/`JSON_CONTAINS` 全包含匹配 |
| `checkIn` / `checkOut` | string? (`YYYY-MM-DD`)                        | 与 `roomsNeeded`、`peopleNeeded` 一起传入时启用库存过滤，`checkOut` 不包含当日      |
| `roomsNeeded`          | number?                                       | 需要房间数（≥1），用于筛选 `库存最小值 >= roomsNeeded`                              |
| `peopleNeeded`         | number?                                       | 需要容纳总人数（≥1），用于筛选 `capacity * roomsNeeded >= peopleNeeded`             |
| `page` / `pageSize`    | number?                                       | 默认 `1` / `15`                                                                     |

> 说明：`checkIn`、`checkOut`、`roomsNeeded`、`peopleNeeded` 需同时传入；若只传部分字段，接口将返回 400。

> 返回规则：接口最终会过滤掉 `available_count = 0` 的房型。

响应：

```jsonc
{
  "total": 6,
  "data": [
    {
      "id": 101,
      "hotelId": 12,
      "name": "豪华大床房",
      "areaTitle": "35-50",
      "bedTitle": "双人床",
      "windowTitle": "有",
      "smokeTitle": "禁烟",
      "wifiInfo": "有",
      "pictureUrl": "https://.../room101.jpg",
      "price": 688,
      "available_count": 4,
      "cleaningFacilities": ["DAILY_CLEANING"],
      "bathingFacilities": ["BATHTUB"],
      "...": "...",
    },
  ],
}
```

### 4. GET /rooms/:id/detail?checkIn=2026-02-15&checkOut=2026-02-17

- 控制器：`RoomsController.detail`
- Query DTO：`RoomDetailQueryDto`
- 返回 `RoomDetailDto`，在 `RoomListItemDto` 的基础上追加设施分组、`floorTitle`、`capacity`，并同样附带 `availableCount`（所选区间库存最小值）：

```jsonc
{
  "id": 101,
  "hotelId": 12,
  "name": "豪华大床房",
  "areaTitle": "35-50",
  "bedTitle": "双人床",
  "windowTitle": "有",
  "smokeTitle": "禁烟",
  "wifiInfo": "有",
  "pictureUrl": "https://.../room101.jpg",
  "price": 688,
  "availableCount": 4,
  "floorTitle": "16F",
  "capacity": 3,
  "cleaningFacilities": ["DAILY_CLEANING", "IRONING"],
  "bathingFacilities": ["BATHTUB", "SMART_TOILET"],
  "roomSpecFacilities": ["SMART_HOME"],
  "viewFacilities": ["CITY_VIEW"],
}
```

> 小贴士：前端可通过 `/hotels/search` -> `/hotels/:id/detail` -> `/rooms/:id/detail` 的链式调用，在同一份查询条件（入住日期、人房数量、标签）下获取酒店列表、酒店详情（含房型库存）以及具体房型详情。

### 5. GET /hotels/promotions?type=FLASH_SALE

- 控制器：`HotelsController.findByPromotion`
- 作用：按促销类型查询**当前生效**（`startDate <= now <= endDate`）且状态为已发布（`status = 1`）的酒店列表。
- Query 参数：

| 字段   | 类型            | 必填 | 说明                   |
| ------ | --------------- | ---- | ---------------------- |
| `type` | `PromotionType` | ✅   | 促销类型，必须是枚举值 |

`PromotionType` 可选值（来自 Prisma 枚举）：

- `FLASH_SALE`（限时特卖）
- `HOLIDAY_SPECIAL`（节假日特惠）
- `WEEKEND_DEAL`（周末特惠）
- `NEW_OPEN`（开业特惠）
- `SEASONAL`（季节性优惠）
- `MEMBER_EXCLUSIVE`（会员专享）

请求示例：

```http
GET /hotels/promotions?type=FLASH_SALE
```

响应示例（`HotelListItemDto[]`，每个酒店会带命中的 `promotions`）：

```jsonc
[
  {
    "id": 12,
    "nameCn": "易宿大酒店",
    "price": 688,
    "currency": "RMB",
    "promotions": [
      {
        "id": 5,
        "promotionType": "FLASH_SALE",
        "discount": 0.85,
        "startDate": "2026-02-01T00:00:00.000Z",
        "endDate": "2026-02-28T00:00:00.000Z",
      },
    ],
  },
]
```

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

| 字段                                        | 类型              | 必填    | 默认值/说明                                                                           |
| ------------------------------------------- | ----------------- | ------- | ------------------------------------------------------------------------------------- |
| `nameCn` / `nameEn`                         | string            | ✅      | 酒店名称（中/英）                                                                     |
| `address`                                   | string            | ✅      | 详细地址                                                                              |
| `starRating`                                | number 1~5        | ✅      | 星级                                                                                  |
| `cityCode`                                  | string            | ✅      | 三字码                                                                                |
| `openingDate`                               | ISO string        | ✅      | 开业日期                                                                              |
| `tags`                                      | string[]          | ⛔ 可选 | 不传则保存 `[]`                                                                       |
| `imageUrls`                                 | string[]          | ⛔ 可选 | 若通过 `images` 文件字段上传，后台会自动生成 `/static/hotels/<filename>` 并覆盖此字段 |
| `latitude` / `longitude`                    | number            | ✅      | 支持浮点                                                                              |
| `hasFreeWifi / hasTV / hasParking / hasGym` | boolean           | ⛔ 可选 | 默认 `false`                                                                          |
| `rooms`                                     | `CreateRoomDto[]` | ⛔ 可选 | 结构见下                                                                              |

房型 `CreateRoomDto` 字段：

| 字段                      | 类型            | 必填    | 默认值/说明                  |
| ------------------------- | --------------- | ------- | ---------------------------- |
| `roomName`                | string          | ✅      | 房型名称                     |
| `price` / `originalPrice` | string          | ✅      | 建议用字符串表示 Decimal     |
| `bedType`                 | `BedType`       | ✅      | 例如 `LARGE_BED`、`TWIN_BED` |
| `areaRange`               | `RoomAreaRange` | ✅      | 例如 `UNDER_25`、`GTE_30`    |
| `totalStock`              | int ≥ 1         | ✅      | 用于初始化 60 天房量         |
| `mealType`                | `MealType`      | ⛔ 可选 | 默认 `NONE`                  |
| `capacity`                | int ≥ 1         | ⛔ 可选 | 默认 `2`                     |

> 提交该接口时请使用 `multipart/form-data`，文本字段与 `images`（多文件）一并上传。后台会把图片保存到 `/static/hotels/<filename>` 并写入 `imageUrls`。创建房型后，后端会自动生成未来 60 天的 `RoomInventory`，将 `availableCount` 设为 `totalStock`，`price` 设为房型 `price`。

### POST /api/merchant/hotels/from-url

- 方法：`createFromUrl`
- 作用：与上方 `create` 相同，但允许脚本或后台任务直接提交 JSON（`application/json`），其中 `imageUrls` 必须包含完整的图片 URL 列表，后端不会处理文件上传。

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
  "hasFreeWifi": true,
  "hasTV": true,
  "hasParking": false,
  "hasGym": false,
  "imageUrls": [
    "https://cdn.easyhotel.com/hotels/12/main.jpg",
    "https://cdn.easyhotel.com/hotels/12/lobby.jpg"
  ],
  "latitude": 39.9042,
  "longitude": 116.4074,
  "rooms": [
    {
      "roomName": "豪华大床房",
      "price": "800.00",
      "originalPrice": "1000.00",
      "bedType": "LARGE_BED",
      "areaRange": "GTE_30",
      "mealType": "BREAKFAST",
      "capacity": 3,
      "totalStock": 10
    }
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
  "imageUrls": [
    "https://cdn.easyhotel.com/hotels/12/main.jpg",
    "https://cdn.easyhotel.com/hotels/12/lobby.jpg"
  ],
  "latitude": "39.9042",
  "longitude": "116.4074",
  "hasFreeWifi": true,
  "hasTV": true,
  "hasParking": false,
  "hasGym": false,
  "auditReason": null,
  "merchant": {
    "id": 3,
    "username": "merchant_a"
  },
  "rooms": [
    {
      "id": 21,
      "hotelId": 12,
      "roomName": "豪华大床房",
      "price": "800.00",
      "originalPrice": "1000.00",
      "bedType": "LARGE_BED",
      "areaRange": "GTE_30",
      "mealType": "BREAKFAST",
      "capacity": 3,
      "totalStock": 10
    }
  ]
}
```

### POST /api/merchant/hotels/:hotelId/rooms

- 方法：`create`
- 作用：为指定酒店追加房型。提交 `multipart/form-data`，文本字段遵循上文 `CreateRoomDto`，图片文件放在 `image` 字段；若不上传 `image`，则需提供 `pictureUrl`。创建后自动生成未来 60 天库存 (`availableCount = totalStock`)。

### POST /api/merchant/hotels/:hotelId/rooms/from-url

- 方法：`createFromUrl`
- 作用：JSON 方式快速新增房型。无需上传文件，但 `pictureUrl` 必须提供可访问的图片 URL。

### PUT /api/merchant/rooms/:id

- 方法：`update`
- 作用：修改房型属性或未来库存。提交 `multipart/form-data`，若上传新的 `image` 会覆盖现有封面；若不上传则可通过 `pictureUrl` 保持/更新。
- Body Schema：`UpdateRoomDto`（全部字段可选）。如传入：
  - `totalStock`：后台将所有未到期的 `RoomInventory.availableCount` 重置为该值。
  - `price`：同步更新未来库存的 `price`。
  - 其他字段（设施数组、`capacity` 等）只影响房型表本身。

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
    "merchantId": 3,
    "nameCn": "易宿大酒店",
    "address": "北京市朝阳区...",
    "starRating": 5,
    "cityCode": "BJS",
    "status": 0,
    "auditReason": null,
    "openingDate": "2023-01-01T00:00:00.000Z",
    "imageUrls": [
      "https://cdn.easyhotel.com/hotels/12/main.jpg",
      "https://cdn.easyhotel.com/hotels/12/lobby.jpg"
    ],
    "latitude": "39.9042",
    "longitude": "116.4074",
    "hasFreeWifi": true,
    "hasTV": true,
    "hasParking": false,
    "hasGym": false,
    "merchant": {
      "id": 3,
      "username": "merchant_a"
    }
  },
  {
    "id": 15,
    "merchantId": 3,
    "nameCn": "易宿外滩店",
    "address": "上海市浦东新区...",
    "starRating": 4,
    "cityCode": "SHA",
    "status": 1,
    "auditReason": null,
    "openingDate": null,
    "imageUrls": ["https://cdn.easyhotel.com/hotels/15/main.jpg"],
    "latitude": "31.2304",
    "longitude": "121.4737",
    "hasFreeWifi": false,
    "hasTV": true,
    "hasParking": true,
    "hasGym": false,
    "merchant": {
      "id": 3,
      "username": "merchant_a"
    }
  }
]
```

### GET /api/merchant/hotels/:hotelId/promotions

- 方法：`listPromotions`
- 作用：查询当前商户某酒店下的全部促销（按 `startDate` 升序）。
- 权限：商户 JWT，且酒店必须属于当前商户。

响应示例：

```json
[
  {
    "id": 5,
    "hotelId": 12,
    "promotionType": "FLASH_SALE",
    "discount": "0.85",
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": "2026-02-28T00:00:00.000Z",
    "createdAt": "2026-02-10T08:00:00.000Z",
    "updatedAt": "2026-02-10T08:00:00.000Z"
  }
]
```

### POST /api/merchant/hotels/:hotelId/promotions

- 方法：`createPromotion`
- 作用：为指定酒店新增促销。

Body（`CreateHotelPromotionDto`）：

| 字段            | 类型              | 必填 | 说明                                                      |
| --------------- | ----------------- | ---- | --------------------------------------------------------- |
| `promotionType` | `PromotionType`   | ✅   | 促销类型枚举                                              |
| `discount`      | string            | ✅   | 折扣系数，`0 < discount <= 1`（例如 `"0.85"` 表示 85 折） |
| `startDate`     | string (ISO Date) | ✅   | 开始日期                                                  |
| `endDate`       | string (ISO Date) | ✅   | 结束日期，必须晚于 `startDate`                            |

请求示例：

```json
{
  "promotionType": "FLASH_SALE",
  "discount": "0.85",
  "startDate": "2026-02-20",
  "endDate": "2026-02-28"
}
```

### PUT /api/merchant/hotels/:hotelId/promotions/:promotionId

- 方法：`updatePromotion`
- 作用：更新促销，字段均可选（`UpdateHotelPromotionDto`）。
- 规则：若更新日期，仍需满足 `endDate > startDate`。

请求示例：

```json
{
  "discount": "0.80",
  "endDate": "2026-03-03"
}
```

### DELETE /api/merchant/hotels/:hotelId/promotions/:promotionId

- 方法：`removePromotion`
- 作用：删除指定促销。

成功响应：

```json
{
  "deleted": true
}
```

### hotel_promotion 常见错误

- `404 hotel not found`：酒店不存在。
- `403 no permission`：酒店不属于当前商户。
- `404 promotion not found`：促销不存在，或不属于该酒店。
- `400 endDate must be after startDate`：结束日期不合法。
- `400 invalid discount` / `400 discount must be between 0 and 1`：折扣格式或取值不合法。

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
