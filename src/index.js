// css 文件
import './assets/css/index.css'

// js 文件
import './js/application'

// js 文件热更新
if (module.hot) {
  module.hot.accept('./js/application.js', () => {})
}
