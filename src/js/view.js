import { DATA } from './info'
import $ from './utils'

export default class View {
  constructor() {
    this.scoreNow = $('header .score .now')
    this.scoreBest = $('header .score .best')
    this.tileBox = $('main .tile-box')
    this.msgBox = $('main .game-message')
    this.msgText = $('main .game-message p')
  }

  /**
   * 清除页面
   */
  clearAll() {
    this.clearBox(this.tileBox)
    this.clearMsg()
  }

  /**
   * 清除所有子元素
   * @param {Node} box 父元素盒
   */
  clearBox(box) {
    while (box.firstChild) {
      box.removeChild(box.firstChild)
    }
  }

  /**
   * 获取方块
   * @param {Number} pos
   * @returns dom 元素（指定的方块）
   */
  getTile(pos) {
    return $(`.tile[data-pos='${pos}']`)
  }

  /**
   * 恢复方块位置，用于恢复本地存储
   */
  restoreTile() {
    DATA.tiles.forEach((elem, index) => {
      if (elem.val !== 0) this.appearTile(index)
    })
  }

  /**
   * 创建方块元素并添加到页面
   * @param {Number} index 方块在 DATA.tiles 中的索引，也是它的位置
   */
  appearTile(index) {
    // 1.获取方块在 tiles 中的信息
    let tileInfo = DATA.tiles[index]

    // 2.创建元素，并设置类名和数值
    let tile = document.createElement('div')
    tile.className = ' tile tile-new'
    tile.textContent = tileInfo.val
    tile.setAttribute('data-pos', tileInfo.pos)
    tile.setAttribute('data-val', tileInfo.val)

    // 3.放入页面
    this.tileBox.appendChild(tile)
  }

  /**
   * 更新方块位置：通过改变 data-pos 的值实现
   * @param {Number} old_index 方块之前的位置
   * @param {Number} index 方块最新的位置
   */
  setPosition(oldPos, newPos) {
    let tile = this.getTile(oldPos)
    tile.setAttribute('data-pos', newPos)
  }

  /**
   * 更新方块数字，并定时删除类名
   * @param {Number} pos 方块位置
   */
  setValue(pos, value) {
    // 1.获取方块元素
    let tile = this.getTile(pos)

    // 2.给该方块增加数值和类名
    tile.setAttribute('data-val', value)
    tile.textContent = value
    tile.classList.add('tile-merge')

    // 3.定时删除类名
    setTimeout(() => {
      tile.classList.remove('tile-merge')
      tile.classList.remove('tile-new')
    }, 300)
  }

  /**
   * 移除方块元素
   * @param {Number} pos 方块的位置
   */
  removeTile(pos) {
    let tile = this.getTile(pos)
    tile.remove()
  }

  /**
   * 更新分数
   */
  updateScore() {
    this.updateNow(DATA.score)
    this.updateBest()
  }

  /**
   * 更新当前分数与获得分数
   * @param {Number} point 每次获得的分数
   */
  updateNow(point) {
    // 1.清除当前分数
    this.clearBox(this.scoreNow)

    // 2.赋值最新分数
    this.scoreNow.textContent = DATA.score

    // 3.如果分数为 0 直接返回
    if (!point) return

    // 4.创建元素，增加每次操作获得的分数，并添加到页面
    let scorePoint = document.createElement('div')
    scorePoint.classList.add('score-add')
    scorePoint.textContent = `+${point}`
    this.scoreNow.appendChild(scorePoint)
  }

  /**
   * 更新最佳分数
   */
  updateBest() {
    this.scoreBest.textContent = DATA.best
  }

  /**
   * 游戏结束信息
   * @param {Boolean} won 判断游戏是失败还是胜利
   */
  message(won) {
    let type = won ? 'won' : 'failure'
    let msg = won ? 'You win!' : 'Game over!'

    this.msgBox.classList.add(type)
    this.msgText.textContent = msg
  }

  /**
   * 清除结束页面
   */
  clearMsg() {
    this.msgBox.classList.remove('won', 'failure')
  }
}
