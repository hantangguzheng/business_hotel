import React, { useEffect } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { SharedFilterProvider } from './store/filter-context'
import { DEFAULT_LANG, LANG_STORAGE_KEY } from './constants/app'
// 全局样式
import './app.scss'

function App(props) {
  // 可以使用所有的 React Hooks
  useEffect(() => {
    const storedLang = Taro.getStorageSync(LANG_STORAGE_KEY)
    if (!storedLang) {
      Taro.setStorageSync(LANG_STORAGE_KEY, DEFAULT_LANG)
    }
  }, [])

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})

  return React.createElement(SharedFilterProvider, null, props.children)
}

export default App
