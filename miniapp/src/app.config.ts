export default defineAppConfig({
  pages: [
    'pages/index/index',
    
  ],
  subPackages: [
    {
      root: 'package-hotel',
      pages: [
        'detail/index',
        'list/index'
      ]
    },
    {
      root: 'package-common',
      pages: [
        'city/index'
      ]
    }
  ],
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['package-common','package-hotel'] 
    },
  },
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
