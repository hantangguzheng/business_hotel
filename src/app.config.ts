export default defineAppConfig({
  pages: [
    'pages/list/index',
    'pages/index/index',
    'pages/city/index',
    
    'pages/detail/index',
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
