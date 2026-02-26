# ISU Hotel 移动端用户预定流程开发文档

本文档面向「用户端预定流程（移动端）」的研发，聚焦以下 3 个核心页面：

1. 酒店查询页（首页）
2. 酒店列表页
3. 酒店详情页

并围绕功能清单与实现细节落地说明：

| 页面               | 功能说明（摘要）                                        | 备注要求                                                 |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------- |
| 酒店查询页（首页） | Banner、地点/关键词/日期/筛选/快捷标签、查询跳转        | 入住日期需日历组件；筛选/标签可优化体验                  |
| 酒店列表页         | 核心条件筛选头、详细筛选区、酒店列表                    | 详细筛选可优化；列表支持上滑自动加载；卡片信息维度可优化 |
| 酒店详情页         | 顶部导航、图片轮播、基础信息、日历+人间夜、房型价格列表 | 点评/地图可忽略；房型列表按价格从低到高                  |

---

## 2. 项目概览

### 2.1 技术栈

- 框架：Taro + React + TypeScript
- UI 组件：NutUI Taro（`Calendar`、`Popup`、`Button`、`SideNavBarItem` 等）
- 状态：`SharedFilterProvider`（跨页面共享城市、日期、人数、关键词等）
- 地图/定位：腾讯地图 WebService（地理逆解析、POI 查询）

### 2.2 路由

入口路由配置在 `src/app.config.ts`：

- `pages/index/index`（首页）
- `package-common/city/index`（城市页）
- `package-hotel/list/index`（列表页）
- `package-hotel/detail/index`（详情页）

### 2.3 全局共享筛选状态

`src/store/filter-context.tsx` 维护统一筛选条件：

- `city` / `cityCode`
- `keyword`
- `checkIn` / `checkOut`
- `roomCount` / `adultCount` / `childCount`
- `userLat` / `userLng`

默认值：城市「上海」，入住=今天，离店=明天，1间1成人。

---

## 3. 用户端预定流程

1. 用户进入首页，设置地点、关键词、入住离店日期、人数、价格星级和快捷标签
2. 点击查询，跳转列表页并带上全部查询参数
3. 列表页展示结果，支持排序、价格/星级筛选、详细筛选、快捷标签、上滑自动加载
4. 用户进入详情页，查看酒店图文与基础信息
5. 在详情页设置日期和人数，查看并筛选房型，房型列表按价格升序
6. 选择房型后展示总价（晚数 × 间数 × 单价），进入确认动作

> 说明：当前代码的「确认」按钮已呈现结算信息，但未接入支付/订单创建接口。

---

## 4. 页面说明

## 4.1 酒店查询页（首页）

页面文件：`src/pages/index/index.tsx`

### 4.1.1 功能点对照

#### 1) 顶部 Banner（广告位，点击跳详情）

- 实现：`Swiper + SwiperItem` 轮播 `BANNER_ITEMS`
- 交互：点击 Banner -> 先尝试拉取酒店详情更新城市信息 -> 跳转详情页
- 跳转：`/package-hotel/detail/index?id={hotelId}`

#### 2) 核心查询区域

**a. 当前地点（支持定位）**

- 城市选择入口：跳转城市页 `package-common/city`
- 定位逻辑：`Taro.authorize + Taro.getLocation + 腾讯逆地理`
- 存储键：
  - `CITY_STORAGE_KEY`
  - `CITY_LOCATION_INFO_KEY`
  - `CITY_ADDRESS_KEY`
- 支持“我的位置”模式（`MY_LOCATION_KEY`）

**b. 关键词搜索**

- 输入组件：`Input`
- 绑定全局状态：`filter.keyword`

**c. 入住/离店日期选择**

- 日历组件：`Calendar type="range"`
- 结果写回：`filter.checkIn/checkOut`

**d. 筛选条件（价格/星级）**

- 弹层：`Popup + PriceStarPopup`
- 支持区间价格、星级上下限

**e. 快捷标签（酒店属性）**

- 来源常量：`QUICK_FILTER_TAGS`
- 当前默认标签：
  - 4.7分以上
  - 自助早餐
  - 新开业
  - 双床房
  - 自助入住
  - 暖气
- 点击标签直接触发查询并带 `quickTag`

#### 3) 查询按钮，跳转列表页

- 查询前校验：城市、日期、房间数
- 构造参数：城市、关键词、日期、价格、星级、人数、快捷标签
- 跳转：`/package-hotel/list/index?...`

### 4.1.2 与需求备注匹配

- 「入住日期需开发日历组件」：已实现（基于 NutUI `Calendar` 的范围日历）
- 「筛选条件和快捷标签可自行定义」：已提供价格/星级弹层 + 6 个快捷标签，满足可扩展性

---

## 4.2 酒店列表页

页面文件：`src/package-hotel/list/index.tsx`

### 4.2.1 功能点对照

#### 1) 顶部核心条件筛选头

支持项（满足要求中的城市/日期/间夜/搜索设置）：

- 城市（含我的位置）
- 入住/离店日期
- 间夜（自动计算）
- 人数与房间数
- 关键词输入

实现形态：

- 顶部搜索条 + Trip Popdown（城市/日期/人数编辑）
- 日期使用 `Calendar range`
- 人数使用 `GuestSelector`

#### 2) 详细筛选区域

已实现多维筛选：

- 酒店设施（由 `HOTEL_CN_TO_DB_TAG_MAP` 映射）
- 客房设施（按清洁/卫浴/网络等分组）
- 房间面积
- 评分阈值

并提供：

- 排序：智能、距离、价格、评分
- 价格/星级弹层（`PriceStarPopup`）
- 快捷标签（同首页）

#### 3) 酒店列表

组件：`src/package-hotel/hotel-list/components/index.tsx`

卡片信息维度包含：

- 酒店名（中英文）
- 星级（钻图标）
- 评分
- 地址
- 距离（定位模式下）
- 价格（现价/划线价）
- 酒店标签（最多 3 个）
- 活动标签（促销文案）
- 晚数显示

### 4.2.2 自动加载（上滑加载）

- 分页常量：`PAGE_SIZE = 20`
- 触发：`useReachBottom`
- 条件：非首屏加载中、非加载更多中、`hasMore=true`
- 处理：请求下一页并去重合并酒店 ID

### 4.2.3 请求参数构造与后端联动

API：`searchHotels` (`src/apis/hotels.ts`)

关键参数：

- 城市：`cityCode`
- 日期：`checkIn/checkOut`（会标准化）
- 入住需求：`roomsNeeded/peopleNeeded`
- 价格星级：`minPrice/maxPrice/minStar/maxStar`
- 关键词：`keyword`
- 快捷与详细筛选：`tags` + `room.tags/facilities`
- 排序：`sortBy`（distance/price/score）
- 定位：`userLat/userLng`
- 分页：`page/pageSize`

### 4.2.4 价格与排序规则

- 智能排序：评分优先，其次距离（定位模式）再价格
- 距离排序：仅在“我的位置”模式可用
- 价格排序：按折后价升序
- 评分排序：评分降序

### 4.2.5 Tag筛选

- 详细筛选：已实现多分组侧栏筛选 + 快捷标签 + 价格星级独立弹层

---

## 4.3 酒店详情页

页面文件：`src/package-hotel/detail/index.tsx`

### 4.3.1 功能点对照

#### 1) 顶部导航头（酒店名 + 返回）

- 标题来源：路由参数与酒店详情数据
- 返回行为：使用页面栈默认返回（由小程序导航栏承担）

#### 2) 大图 Banner（左右滑动）

- 组件：`Swiper`
- 数据：`hotel.imageUrls`
- 兜底图：`FALLBACK_HOTEL_IMAGE_URL`

#### 3) 酒店基础信息（酒店名/星级/设施/地址）

已呈现：

- 酒店名（中英文）
- 星级/钻级
- 评分卡片
- 设施标签（图标 + 文案）
- 地址

> 需求备注中提到点评/地图可忽略。当前实现中有评分与地图能力，属于扩展增强，不影响需求达成。

#### 4) 日历 + 人间夜 Banner

- 日期区：点击打开 `Calendar range`
- 人数组：点击打开 `GuestSelector`
- 展示：入住离店 + 房间/成人/儿童
- 晚数：自动计算 `nights`

#### 5) 酒店当前房型价格列表

组件：`src/package-hotel/detail/components/room-list/index.tsx`

房型信息包含：

- 房型图
- 房型名
- 核心标签（面积/床型/窗型/吸烟/网络）
- 库存
- 现价/划线价
- 促销标签

筛选与排序：

- 房型标签筛选（楼层/面积/床型/设施等）
- **房型按价格升序排序**（满足需求备注）

### 4.3.2 价格计算与预定态

- 房型价格来源：`searchRooms` 结果 + 活动折扣
- 预定态：点击“订”后记录 `bookingState`（房型ID + 单价）
- 底部总价：`单价 × 晚数 × 房间数`

### 4.3.3 接口联动

- 酒店详情：`getHotelDetail(hotelId, checkIn, checkOut)`
- 房型列表：`searchRooms({ hotelId, checkIn, checkOut, roomsNeeded, peopleNeeded, pageSize })`

### 4.3.4 与需求备注匹配

- 「房型列表按价格从低到高」：已实现（房型过滤前进行升序排序）
- 「点评/地图可忽略」：当前虽实现评分与地图，但不影响验收，可视为加分项

### 4.3.5 验收建议

- 同一酒店切换日期后，房型与价格实时刷新
- 房型筛选标签多选后结果正确收敛
- 选房后底部总价与晚数、间数一致

---

## 5. 关键接口与数据模型

## 5.1 酒店搜索接口

- 方法：`POST /hotels/search`
- 封装：`src/apis/hotels.ts#searchHotels`
- 返回：`SearchHotelsResponse`

核心模型：`src/apis/type.ts`

- 请求：`SearchHotelsParams`
- 响应项：`HotelListItem`

## 5.2 酒店详情接口

- 方法：`GET /hotels/{hotelId}/detail?checkIn=&checkOut=`
- 封装：`src/apis/hotels.ts#getHotelDetail`
- 模型：`HotelDetailItem`

## 5.3 房型搜索接口

- 方法：`POST /rooms/search`
- 封装：`src/apis/rooms.ts#searchRooms`
- 模型：`SearchRoomsParams` / `HotelRoomItem`

---

## 6. 亮点功能

以下为产品体验与技术实现亮点，已在当前项目中落地：

### 6.1 一键定位

- 首页支持一键定位，完成授权后可自动识别当前城市并写入查询条件。
- 列表页支持在顶部条件区切换“我的位置”，并联动距离相关能力。
- 定位信息在本地持久化（城市、地址、经纬度），跨页面、二次进入仍可复用。

### 6.2 城市地图

- 列表页提供地图入口，可直接打开地图查看当前城市/酒店区域。
- 详情页支持一键打开全屏地图并定位到酒店坐标。

### 6.3 位置周边

- 详情页基于腾讯地图 POI 搜索聚合周边信息，包含交通、景点、餐饮/商圈等。
- 周边数据按距离处理并转换为可读文本（步行/驾车时间 + 距离），降低用户决策成本。
- 支持多类 POI 去重与结构化展示，提升信息可读性。

### 6.4 场景化排序

- 列表页在定位模式下开放“距离优先”；非定位模式下自动回退智能排序，避免无效排序体验。
- 详情页房型支持多维标签筛选（楼层/面积/床型/设施）并联动排序，兼顾可选性与比价效率。

### 6.5 促销活动

- 自动校验活动生效时间（开始/结束时间），仅对有效活动参与价格计算与文案展示。
- 价格展示同时支持“促销价 + 划线价 + 活动标签”联动，突出优惠感知。
- 活动类型支持中文映射（如折扣、套餐等），提升活动信息可读性。
