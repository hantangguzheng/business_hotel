export default defineAppConfig({
  pages: [
    'pages/detail/index',
    'pages/index/index',
    'pages/city/index',
    'pages/list/index',
    
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
