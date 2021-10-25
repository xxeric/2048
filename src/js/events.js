import $ from './utils'
import Main from './main'

export default class Interaction extends Main {
  constructor() {
    super()
    this.init()
  }

  init() {
    this.setup()
    this.keyboard()
    this.touch()
    this.newGame()
  }

  /**
   * 键盘敲击
   */
  keyboard() {
    let down = false

    // 1.键盘按下
    this.addEvent(window, 'keydown', e => {
      if (down) return

      let dir = e.keyCode - 37
      if (dir >= 0 && dir <= 3) this.moveTile(dir)

      down = true
    })

    // 2.键盘弹起
    this.addEvent(window, 'keyup', () => {
      down = false
    })
  }

  /**
   * 触摸移动
   */
  touch() {
    this.touchMoveDir($('main'), dir => this.moveTile(dir))
  }

  /**
   * 点击按钮
   */
  newGame() {
    this.addEvent($('.btn'), 'click', e => {
      e.preventDefault()
      this.start()
    })
  }

  /**
   * 绑定事件
   * @param {Element} elem 元素
   * @param {Event} type 事件类型
   * @param {Function} handle 处理函数
   */
  addEvent(elem, type, handle) {
    elem.addEventListener(type, e => handle(e), false)
  }

  /**
   * 触摸移动方向
   * @param {Element} elem 元素
   * @param {Function} callback 处理函数
   */
  touchMoveDir(elem, callback) {
    let move = false
    let dir = null
    const touchPos = {
      beforeX: 0,
      beforeY: 0,
      afterX: 0,
      afterY: 0,
    }

    // 1.触摸开始，记录初始位置
    this.addEvent(elem, 'touchstart', e => {
      touchPos.beforeX = e.touches[0].clientX
      touchPos.beforeY = e.touches[0].clientY
    })

    // 2.持续移动，记录改变的位置
    this.addEvent(elem, 'touchmove', e => {
      move = true
      touchPos.afterX = e.touches[0].clientX
      touchPos.afterY = e.touches[0].clientY
    })

    // 3.触摸结束，计算移动距离
    this.addEvent(elem, 'touchend', () => {
      if (!move) return
      move = false

      let x = touchPos.beforeX - touchPos.afterX
      let y = touchPos.beforeY - touchPos.afterY

      if (Math.abs(x) < 15 && Math.abs(y) < 15) return

      // x > y: 左右滑动，left: 0 right: 2
      // x < y: 上下滑动，top: 1 bottom: 3
      if (Math.abs(x) > Math.abs(y)) {
        dir = x > 0 ? 0 : 2
      } else {
        dir = y > 0 ? 1 : 3
      }

      callback(dir)
    })
  }
}
