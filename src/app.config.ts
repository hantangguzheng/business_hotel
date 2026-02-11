export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/city/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  requiredPrivateInfos: [
    'getLocation'
  ]
})
