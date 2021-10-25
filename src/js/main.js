import { CONFIG, DATA, POSITION } from './info'
import View from './view'

export default class Main extends View {
  constructor() {
    super()
    this.cell = DATA.tiles
    this.isMove = false
    this.over = false
  }

  /**
   * 页面刷新
   */
  setup() {
    this.clearAll()
    this.restoreLocalStorage()
    this.updateScore()
  }

  /**
   * 游戏开始
   */
  start() {
    DATA.score = 0
    this.over = false
    this.clearAll()
    this.initial()
    this.addStartTile()
    this.updateScore()
    this.setLocalStorage()
  }

  /**
   * 初始化所有方块数据
   */
  initial() {
    for (let i = 0; i < 16; i++) {
      this.cell[i] = {
        val: 0,
        pos: i,
      }
    }
  }

  /**
   * 随机增加两个方块
   */
  addStartTile() {
    for (let i = 0; i < 2; i++) {
      this.randomAddTile()
    }
  }

  /**
   * 随机增加一个方块
   */
  randomAddTile() {
    // 1.没有空白区域时，直接返回
    if (!this.isValZero()) return

    while (true) {
      // 2.生成随机数
      let index = Math.floor(Math.random() * this.cell.length)

      // 3.在空白处增加方块
      let exist = this.cell[index].val === 0
      if (exist) {
        let value = Math.random() > 0.9 ? 4 : 2
        this.addTile(index, value)
        break
      }
    }
  }

  /**
   * 是否存在空白区域
   * @returns 可用的网格数量
   */
  isValZero() {
    let zeroVal = this.cell.filter(elem => elem.val === 0)

    return zeroVal.length
  }

  /**
   * 存储方块数据，并添加到页面
   * @param {Number} index 方块位置
   * @param {Number} value 方块数值
   */
  addTile(index, value) {
    this.cell[index] = {
      val: value,
      pos: index,
    }

    this.appearTile(index)
  }

  /**
   * 移动方块
   * @param {Number} dir 方向：0 1 2 3
   */
  moveTile(dir) {
    // 1.游戏结束直接退出
    if (this.over) return

    let _point = 0
    let chunk = []

    // 2.左右：0/2，上下：1/3
    if (dir === 0 || dir === 2) {
      chunk = this.chunkX()
    } else if (dir === 1 || dir === 3) {
      chunk = this.chunkY()
    }

    // 3.向右或向下滑动，嵌套数组的内部顺序进行翻转
    if (dir === 2 || dir === 3) {
      chunk = this.arrayInnerReverse(chunk)
    }

    // 4.根据不同方向，遍历每一个 item
    chunk.forEach((itemArr, index) => {
      _point += this.moveInfo(itemArr, POSITION[dir][index])
    })

    // 5.新增分数并更新
    this.addScore(_point)

    // 6.如果还可以移动，随机增加一个方块
    if (this.isMove) {
      this.randomAddTile()
      this.isMove = false
    }

    // 7.保存当前数据
    this.setLocalStorage()

    // 8.判断游戏是否胜利
    this.won()

    // 9.如果已经没有空白区域，判断游戏是否失败
    if (!this.isValZero()) this.failure()
  }

  /**
   * 按 x 轴方向（行）分为 4 组
   * @returns {Array} 分组结果
   */
  chunkX() {
    const cellX = []

    for (let i = 0; i < this.cell.length; i += 4) {
      let item = this.cell.slice(i, i + 4)
      cellX.push(item)
    }

    return cellX
  }

  /**
   * 按 y 轴方向（列）分为 4 组
   * @returns {Array} 分组结果
   */
  chunkY() {
    const cellX = this.chunkX()
    const cellY = [[], [], [], []]

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        cellY[j][i] = cellX[i][j]
      }
    }

    return cellY
  }

  /**
   * 对 chunk 内的嵌套数组成员顺序进行翻转
   * @param {Array} chunk 分组后的数组
   * @returns {Array} 翻转后的新数组
   */
  arrayInnerReverse(chunk) {
    chunk.forEach(itemArr => itemArr.reverse())

    return chunk
  }

  /**
   * 新增分数
   * @param {Number} point 分数
   */
  addScore(point) {
    // 1.将获得的分数加到当前分数上
    DATA.score += point

    // 2.如果最高分低于当前分数，则赋值给最高分
    if (DATA.best < DATA.score) {
      DATA.best = DATA.score
      this.updateBest()
    }

    // 3.更新当前分数和新获得分数
    this.updateNow(point)
  }

  /**
   * 方块移动过程
   * @param {Array} itemArr groups 的每一行
   * @param {Array} linePos 二维数组 POSITION 中 dir 的每一行
   * @returns 分数
   */
  moveInfo(itemArr, linePos) {
    // 1.初始化变量，保存每次获得的分数
    let _point = 0

    // 2.筛选在当前行中，数值不为 0 的网格，即已存在的方块
    let _existTiles = itemArr.filter(elem => elem.val !== 0)

    // 3.根据当前行的方块个数，进行不同的处理
    switch (_existTiles.length) {
      // 有 1 个方块时
      case 1:
        this.normalMove(_existTiles, linePos)
        break
      // 有 2 个方块时
      case 2:
        _point += this.twoTileMove(_existTiles, linePos, _point)
        break
      // 有 3 个方块时
      case 3:
        _point += this.threeTileMove(_existTiles, linePos, _point)
        break
      // 有 4 个方块时
      case 4:
        _point += this.fourTileMove(_existTiles, linePos, _point)
        break
      // 没有方块时
      default:
        _point += 0
    }

    return _point
  }

  /**
   * 正常移动
   * @param {Array} existTiles 每行 val !== 0 的方块组成的数组
   * @param {Array} linePos 二维数组 POSITION[dir] 中存储位置的数组
   */
  normalMove(existTiles, linePos) {
    existTiles.forEach((elem, index) => {
      this.updatePosition(elem.pos, linePos[index])
    })
  }

  /**
   * 当前行有 2 个方块时
   * @param {Array} existTiles 当前行中数值不为 0 的网格
   * @param {Array}} linePos 可选位置
   * @param {Number} point 每次增加的分数
   */
  twoTileMove(existTiles, linePos, point) {
    // 1.两个方块相同
    if (existTiles[0].val === existTiles[1].val) {
      // 合并到 linePos[0] 记录的位置
      this.mergeMove(existTiles, linePos, 0, 1, 0)

      // 增加分数
      point += CONFIG.point
    }

    // 2.两个方块不同
    else {
      this.normalMove(existTiles, linePos)
    }

    // 3.返回增加的分数
    return point
  }

  /**
   * 当前行有 3 个方块时
   * @param {Array} existTiles 当前行中数值不为 0 的网格
   * @param {Array}} linePos 可选位置
   * @param {Number} point 每次增加的分数
   */
  threeTileMove(existTiles, linePos, point) {
    // 1.第一个方块和第二个方块相同
    if (existTiles[0].val === existTiles[1].val) {
      // 第一个和第二个合并到 linePos[0] 记录的位置
      this.mergeMove(existTiles, linePos, 0, 1, 0)

      // 第三个方块往前移一位，到 linePos[1] 记录的位置
      this.updatePosition(existTiles[2].pos, linePos[1])

      // 增加分数
      point += CONFIG.point
    }
    // 2.第二个方块和第三个方块相同
    else if (existTiles[1].val === existTiles[2].val) {
      // 第一个方块到 linePos[0] 记录的位置
      this.updatePosition(existTiles[0].pos, linePos[0])

      // 第二个和第三个合并到 linePos[1] 记录的位置
      this.mergeMove(existTiles, linePos, 1, 2, 1)

      // 增加分数
      point += CONFIG.point
    }
    // 3.无法合并时
    else {
      this.normalMove(existTiles, linePos)
    }

    // 4.返回增加的分数
    return point
  }

  /**
   * 当前行有 4 个方块时
   * @param {Array} existTiles 当前行中数值不为 0 的网格
   * @param {Array}} linePos 可选位置
   * @param {Number} point 每次增加的分数
   */
  fourTileMove(existTiles, linePos, point) {
    // 1.第一个方块和第二个方块相同
    if (existTiles[0].val === existTiles[1].val) {
      // 第一个和第二个合并到 linePos[0] 记录的位置
      this.mergeMove(existTiles, linePos, 0, 1, 0)

      // 增加分数
      point += CONFIG.point

      // 判断第三个和第四个是否相同
      if (existTiles[2].val === existTiles[3].val) {
        // 相同，合并到 linePos[1] 记录的位置
        this.mergeMove(existTiles, linePos, 2, 3, 1)
        point += CONFIG.point
      } else {
        // 不相同
        // existTiles[2] 的位置改为 linePos[1]
        // existTiles[3] 的位置改为 linePos[2]
        this.updatePosition(existTiles[2].pos, linePos[1])
        this.updatePosition(existTiles[3].pos, linePos[2])
      }
    }
    // 2.第二个方块和第三个方块相同
    else if (existTiles[1].val === existTiles[2].val) {
      // 第二个和第三个合并到 optionalPos[1] 记录的位置
      this.mergeMove(existTiles, linePos, 1, 2, 1)

      // 第四个往前移一位，到 linePos[2] 记录的位置
      this.updatePosition(existTiles[3].pos, linePos[2])

      // 增加分数
      point += CONFIG.point
    }
    // 3.第三个方块和第四个方块相同
    else if (existTiles[2].val === existTiles[3].val) {
      // 第三个和第四个合并到 optionalPos[2] 记录的位置
      this.mergeMove(existTiles, linePos, 2, 3, 2)

      point += CONFIG.point
    }

    // 4.返回增加的分数
    return point
  }

  /**
   * 合并移动
   * @param {Array} existTiles 每行 val !== 0 的方块组成的数组
   * @param {Array} linePos 二维数组 POSITION[dir] 中存储位置的数组
   * @param {Number} index1 第一个方块在 existTiles 中的索引
   * @param {Number} index2 第二个方块在 existTiles 中的索引
   * @param {Number} indexMerge 合并的方块在 linePos 中的索引
   */
  mergeMove(existTiles, linePos, index1, index2, indexMerge) {
    // 1.获得合并后新的数值和位置
    let newVal = existTiles[index1].val + existTiles[index2].val
    let newPos = linePos[indexMerge]

    // 2.移除前一个方块
    this.undoTile(existTiles[index1].pos)

    // 3.更新后一个方块的位置和数值，作为合并后的新方块
    this.updatePosition(existTiles[index2].pos, newPos)
    this.updateValue(newPos, newVal)
  }

  /**
   * 更新方块位置
   * @param {Number} oldPos 旧位置
   * @param {Number} newPos 新位置
   */
  updatePosition(oldPos, newPos) {
    // 1.位置不变时，不作改动
    if (this.cell[oldPos] === this.cell[newPos]) return

    // 2.打开移动开关
    this.isMove = true

    // 3.旧位置的数值赋值到新位置
    this.cell[newPos].val = this.cell[oldPos].val

    // 4.旧位置的数值重置为 0
    this.cell[oldPos].val = 0

    // 5.更新到页面
    this.setPosition(oldPos, newPos)
  }

  /**
   * 更新方块数值
   * @param {Number} pos 方块当前的位置
   * @param {Number} value 方块数值
   */
  updateValue(pos, value) {
    this.cell[pos].val = value
    this.setValue(pos, value)
  }

  /**
   * 移除方块
   * @param {Number} pos 方块当前的位置
   */
  undoTile(pos) {
    this.cell[pos].val = 0
    this.removeTile(pos)
  }

  /**
   * 游戏结束
   */
  gameOver() {
    this.over = true
    localStorage.gameState = null
    localStorage.nowScore = 0
  }

  /**
   * 游戏胜利
   */
  won() {
    let isWon = this.cell.find(elem => elem.val === CONFIG.max)

    if (isWon) {
      this.gameOver()
      this.message(true)
    }
  }

  /**
   * 游戏失败
   */
  failure() {
    // 1.设置变量
    let isSame = false

    // 2.进行不同方向的分组
    let cellX = this.chunkX()
    let cellY = this.chunkY()

    // 3.检查临近位置是否存在相同的值
    let sameX = this.checkChunk(cellX, isSame)
    let sameY = this.checkChunk(cellY, sameX)

    // 4.上下左右都无法移动时，游戏结束
    setTimeout(() => {
      if (!sameX && !sameY) {
        this.gameOver()
        this.message(false)
      }
    })
  }

  /**
   * 检查分组数组
   * @param {Array} chunk 分组后的数组
   * @param {Boolean} isSame 是否存在符合条件的成员
   * @returns
   */
  checkChunk(chunk, isSame) {
    if (isSame) return
    let result = chunk.some(itemArr => this.checkItem(itemArr))

    return result
  }

  /**
   * 检查分组成员
   * @param {Array} itemArr 分组后的每个成员
   * @returns {Boolean} item 中是否存在临近位置相同的值
   */
  checkItem(itemArr) {
    let _exist = itemArr.some((elem, index, itemArr) => {
      // 倒数第二个和最后一个比较完成后就退出
      if (index === itemArr.length - 1) return

      // 当前元素的值是否与后一位元素的值相同
      return elem.val === itemArr[index + 1].val
    })

    return _exist
  }

  /**
   * 进行本地存储
   */
  setLocalStorage() {
    localStorage.bestScore = DATA.best
    localStorage.nowScore = DATA.score
    localStorage.gameState = JSON.stringify(DATA.tiles)
  }

  /**
   * 获取本地存储数据
   */
  getLocalStorage(key) {
    return localStorage[key] ? JSON.parse(localStorage[key]) : null
  }

  /**
   * 恢复历史存储数据
   */
  restoreLocalStorage() {
    // 1.获取历史分数和游戏状态
    let bestScore = this.getLocalStorage('bestScore')
    let nowScore = this.getLocalStorage('nowScore')
    let gameState = this.getLocalStorage('gameState')

    // 2.恢复最佳分数
    DATA.best = bestScore || 0

    // 3.恢复当前分数
    DATA.score = nowScore || 0

    // 3.恢复游戏页面
    if (gameState && DATA.score) {
      this.cell = DATA.tiles = gameState
      this.restoreTile()
    } else {
      this.initial()
      this.addStartTile()
    }
  }
}
