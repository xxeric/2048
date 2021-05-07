// css 文件
import './css/reset.css'
import './css/common.css'
import './css/header.css'
import './css/main.css'
import './css/footer.css'
import './css/media.css'

// js 文件
import './js/application'

// js 文件热更新
if (module.hot) {
  module.hot.accept('./js/application.js', () => {})
}
