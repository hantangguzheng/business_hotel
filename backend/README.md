# backend_for_easyhotel
backend program for easyhotel with typescript

# 用户注册和登录操作

	•	Base URL：http://localhost:3000
	•	Content-Type：application/json
	•	认证方式：JWT Bearer Token
	•	Header：Authorization: Bearer <access_token>

## 注册

### POST /auth/register

用于创建账号。前端在注册页选择角色（商户/管理员）后，把 role 一起提交。

Request Body:
```json
{
  "username": "m1",
  "password": "123456",
  "role": "MERCHANT"
}
```

Response 200:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Response 400:
	•	400 username already exists：用户名已注册
	•	400 DTO 校验失败：缺字段/密码太短/role 非法值等


## 登录

### POST /auth/login

Requset Body:
```json
{
  "username": "m1",
  "password": "123456"
}
```

Response 200:
```json
{
  "access_token": "..."
}
```

### GET /users/me

前端登录拿到 access_token 后，调用此接口即可得到当前账号身份（role）。

Headers:
Authorization: Bearer <access_token>

Response 200:
```json
{
  "userId": 1,
  "username": "m1",
  "role": "MERCHANT"
}
```
