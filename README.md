# ISU Hotel 移动端用户预定流程开发文档

## 1. 文档目标与范围

本文档面向「用户端预定流程（移动端）」的研发、测试、产品联调，聚焦以下 3 个核心页面：

1. 酒店查询页（首页）
2. 酒店列表页
3. 酒店详情页

并围绕以下评分标准落地实现说明：

| 页面               | 功能说明（摘要）                                        | 权重分数 | 备注要求                                                 |
| ------------------ | ------------------------------------------------------- | -------: | -------------------------------------------------------- |
| 酒店查询页（首页） | Banner、地点/关键词/日期/筛选/快捷标签、查询跳转        |        5 | 入住日期需日历组件；筛选/标签可优化体验                  |
| 酒店列表页         | 核心条件筛选头、详细筛选区、酒店列表                    |       15 | 详细筛选可优化；列表支持上滑自动加载；卡片信息维度可优化 |
| 酒店详情页         | 顶部导航、图片轮播、基础信息、日历+人间夜、房型价格列表 |       15 | 点评/地图可忽略；房型列表按价格从低到高                  |

---

## 2. 项目技术与结构概览

### 2.1 技术栈

- 框架：Taro + React + TypeScript
- UI 组件：NutUI Taro（`Calendar`、`Popup`、`Button`、`SideNavBarItem` 等）
- 状态：`SharedFilterProvider`（跨页面共享城市、日期、人数、关键词等）
- 地图/定位：腾讯地图 WebService（地理逆解析、POI 查询）

### 2.2 路由

入口路由配置在 `src/app.config.ts`：

- `pages/index/index`（首页）
- `pages/city/index`（城市页）
- `pages/list/index`（列表页）
- `pages/detail/index`（详情页）

### 2.3 全局共享筛选状态

`src/store/filter-context.tsx` 维护统一筛选条件：

- `city` / `cityCode`
- `keyword`
- `checkIn` / `checkOut`
- `roomCount` / `adultCount` / `childCount`
- `userLat` / `userLng`

默认值：城市「上海」，入住=今天，离店=明天，1间1成人。

---

## 3. 用户端预定主流程（移动端）

## 3.1 流程总览

1. 用户进入首页，设置地点、关键词、入住离店日期、人数、价格星级和快捷标签
2. 点击查询，跳转列表页并带上全部查询参数
3. 列表页展示结果，支持排序、价格/星级筛选、详细筛选、快捷标签、上滑自动加载
4. 用户进入详情页，查看酒店图文与基础信息
5. 在详情页设置日期和人数，查看并筛选房型，房型列表按价格升序
6. 选择房型后展示总价（晚数 × 间数 × 单价），进入确认动作

> 说明：当前代码的「确认」按钮已呈现结算信息，但未接入支付/订单创建接口（文档按当前仓库实现说明）。

---

## 4. 页面级开发说明（按评分要求）

## 4.1 酒店查询页（首页）

页面文件：`src/pages/index/index.tsx`

### 4.1.1 功能点对照

#### 1) 顶部 Banner（广告位，点击跳详情）

- 实现：`Swiper + SwiperItem` 轮播 `BANNER_ITEMS`
- 交互：点击 Banner -> 先尝试拉取酒店详情更新城市信息 -> 跳转详情页
- 跳转：`/pages/detail/index?id={hotelId}`

#### 2) 核心查询区域

**a. 当前地点（支持定位）**

- 城市选择入口：跳转城市页 `pages/city`
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
- 跳转：`/pages/list/index?...`

### 4.1.2 与需求备注匹配

- 「入住日期需开发日历组件」：已实现（基于 NutUI `Calendar` 的范围日历）
- 「筛选条件和快捷标签可自行定义」：已提供价格/星级弹层 + 6 个快捷标签，满足可扩展性

### 4.1.3 验收建议

- 城市/定位切换后，查询参数正确传入列表页
- 日期切换后，列表页与详情页都使用最新日期
- 快捷标签触发查询时，列表结果发生明显变化

---

## 4.2 酒店列表页

页面文件：`src/pages/list/index.tsx`

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

组件：`src/components/hotel-list/index.tsx`

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
- 价格排序：按折后价/有效价升序
- 评分排序：评分降序
- 促销价逻辑：取有效促销中折扣力度最大的活动计算显示价

### 4.2.5 与需求备注匹配

- 「详细筛选可优化」：已实现多分组侧栏筛选 + 快捷标签 + 价格星级独立弹层
- 「列表需支持上滑自动加载」：已实现 `useReachBottom` 分页加载
- 「列表项信息维度可自定义」：当前已覆盖名称/评分/地址/价格/标签/距离/活动等维度

### 4.2.6 验收建议

- 上滑触底连续加载，直至 `hasMore=false`
- 切换排序后列表即时重排
- 组合筛选（如“4.7分以上+双床房+价格区间”）返回稳定结果

---

## 4.3 酒店详情页

页面文件：`src/pages/detail/index.tsx`

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

> 需求备注中提到点评/地图可忽略。当前实现中有评分与地图能力，属于“超出最低要求”的增强，不影响需求达成。

#### 4) 日历 + 人间夜 Banner

- 日期区：点击打开 `Calendar range`
- 人数组：点击打开 `GuestSelector`
- 展示：入住离店 + 房间/成人/儿童
- 晚数：自动计算 `nights`

#### 5) 酒店当前房型价格列表

组件：`src/components/room-list/index.tsx`

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

## 6. 需求完成度结论（按评分点）

## 6.1 首页（5分）

- Banner 跳详情：已完成
- 地点（含定位）：已完成
- 关键词：已完成
- 日期（日历）：已完成
- 筛选（价格/星级）：已完成
- 快捷标签：已完成
- 查询跳列表：已完成

结论：**满足并超出基础要求**。

## 6.2 列表页（15分）

- 核心筛选头（城市/日期/间夜/搜索）：已完成
- 详细筛选：已完成（多维度）
- 酒店列表：已完成（高信息密度）
- 上滑自动加载：已完成

结论：**满足要求且具备较完整筛选体验**。

## 6.3 详情页（15分）

- 顶部导航 + 返回：已完成
- 大图 Banner 左右滑：已完成
- 基础信息：已完成
- 日历+人间夜：已完成
- 房型列表：已完成
- 房型价格升序：已完成

结论：**满足要求，并补充了房型多维筛选与预定态总价计算**。

---

## 7. 代码落点索引

- 首页：`src/pages/index/index.tsx`
- 列表页：`src/pages/list/index.tsx`
- 详情页：`src/pages/detail/index.tsx`
- 城市页：`src/pages/city/index.tsx`
- 酒店列表组件：`src/components/hotel-list/index.tsx`
- 房型列表组件：`src/components/room-list/index.tsx`
- 价格星级组件：`src/components/price-star-popup/index.tsx`
- 人数选择组件：`src/components/guest-selector/index.tsx`
- 全局筛选上下文：`src/store/filter-context.tsx`
- 酒店接口：`src/apis/hotels.ts`
- 房型接口：`src/apis/rooms.ts`
- 类型定义：`src/apis/type.ts`
