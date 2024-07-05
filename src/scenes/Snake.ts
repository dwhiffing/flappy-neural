import { SNAKE_CONFIG as CONFIG } from '../constants'
import { Player } from '../sprites/snake/Player'
import { BaseGame } from './BaseGame'
import { Food } from '../sprites/snake/Food'

const MAX_PLAYER_COUNT = 1000
export class Snake extends BaseGame {
  foods: Phaser.GameObjects.Group
  players: Player[]

  constructor() {
    super('Snake')
  }

  get playersEntries() {
    return this.players
  }

  get foodEntries() {
    return this.foods.children.entries as Food[]
  }

  preload() {
    this.load.setPath('assets')
    this.load.image('brick', 'square.png')
  }

  create() {
    super.create()

    this.cameras.main.setBackgroundColor(0x111111)

    this.players = new Array(MAX_PLAYER_COUNT)
      .fill('')
      .map(() => new Player(this))
    this.foods = this.add.group({ classType: Food, maxSize: 1000 })
    this.time.addEvent({
      callback: () => {
        this.players.forEach((p) => p.tick())
      },
      repeat: -1,
      delay: 250,
    })

    this.reset()
    this.setupUI()
    this.setupDatGUI()
  }

  update() {
    if (this.players.every((p) => !p.active)) {
      this.nextGeneration()
    }
    if (this.isPlayMode) {
      if (this.input.keyboard?.checkDown(this.cursors.left)) {
        this.playersEntries[0].left()
      } else if (this.input.keyboard?.checkDown(this.cursors.right)) {
        this.playersEntries[0].right()
      } else if (this.input.keyboard?.checkDown(this.cursors.up)) {
        this.playersEntries[0].up()
      } else if (this.input.keyboard?.checkDown(this.cursors.down)) {
        this.playersEntries[0].down()
      }
    }
  }

  getSize() {
    const size = CONFIG.tileSize * CONFIG.tileScale
    const buffer = CONFIG.tileBuffer

    return [size - buffer, buffer]
  }

  getBounds() {
    const [size, buffer] = this.getSize()
    const width = Math.floor(this.cameras.main.width / (size + buffer)) - 1
    const height = Math.floor(this.cameras.main.height / (size + buffer)) - 1
    return [width, height]
  }

  reset() {
    super.reset(CONFIG.playerCount, 5, 1)
    this.resetPlayers()
  }

  resetPlayers = () => {
    this.foodEntries.forEach((b) => b.kill())
    this.playersEntries.forEach((p) => p.kill())

    for (let i = 0; i < (this.isPlayMode ? 1 : CONFIG.playerCount); i++) {
      const network = this.neat.networks[i]

      const player = this.players.find((p) => !p.active)
      player?.spawn(i, network)
      this.foods.get().spawn(i, player?.data)
    }
  }

  checkForNextGen() {
    if (this.playersEntries.filter((p) => p.active).length === 0) {
      this.nextGeneration()
    }
  }

  nextGeneration() {
    super.nextGeneration()
    this.resetPlayers()
  }

  setupDatGUI = () => {
    super.setupDatGUI(1, 15)

    this.gui
      .add(CONFIG, 'tileScale', 1, 8, 1)
      .onFinishChange(this.reset.bind(this))

    this.gui
      .add(CONFIG, 'playerCount', 50, 200, 25)
      .onFinishChange(this.reset.bind(this))
  }
}
