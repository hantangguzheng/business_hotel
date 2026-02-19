export default defineAppConfig({
  pages: [
    
    'pages/index/index',
    'pages/city/index',
    'pages/list/index',
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
