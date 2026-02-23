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
  permission: {
    'scope.userLocation': {
      desc: '用于获取您附近的酒店位置'
    }
  },
  lazyCodeLoading: 'requiredComponents',
  requiredPrivateInfos: [
    'getLocation'
  ]
})
