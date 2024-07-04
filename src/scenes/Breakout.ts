import { BREAKOUT_CONFIG as CONFIG } from '../constants'
import { Player } from '../sprites/breakout/Player'
import { Brick } from '../sprites/breakout/Brick'
import { BaseGame } from './BaseGame'

export class Breakout extends BaseGame {
  players: Phaser.GameObjects.Group
  bricks: Phaser.GameObjects.Group
  ball: Phaser.Physics.Arcade.Sprite
  spawnEvent: Phaser.Time.TimerEvent

  constructor() {
    super('Breakout')
  }

  get playersEntries() {
    return this.players.children.entries as Player[]
  }

  get brickEntries() {
    return this.bricks.children.entries as Brick[]
  }

  preload() {
    this.load.setPath('assets')
    this.load.image('player', 'square.png')
    this.load.image('brick', 'square.png')
    this.load.image('background', 'bg.png')
  }

  create() {
    super.create()

    const w = this.cameras.main.width
    const h = this.cameras.main.height

    this.add
      .image(w / 2, h / 2, 'background')
      .setFlipY(true)
      .setScale(1, 4)

    this.ball = this.physics.add
      .sprite(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        'brick',
      )
      .setVelocity(100, 100)

    this.players = this.add.group({
      classType: Player,
      maxSize: 1000,
      runChildUpdate: true,
    })
    this.bricks = this.add.group({ classType: Brick, maxSize: 500 })

    this.reset()
    this.setupUI()
    this.setupDatGUI()
  }

  update() {
    const activePlayers = this.playersEntries.filter((p) => p.active)

    if (activePlayers.length === 0) {
      this.nextGeneration()
      return
    }

    this.physics.overlap(this.bricks, this.ball, (_brick, _ball) => {
      const brick = _brick as Brick
      const ball = _ball as Phaser.Physics.Arcade.Sprite
      brick.kill()
      ball.setVelocity(ball.body!.velocity.x * -1, ball.body!.velocity.y * -1)
    })

    this.physics.overlap(this.players, this.ball, (_brick, _ball) => {
      const brick = _brick as Brick
      const ball = _ball as Phaser.Physics.Arcade.Sprite
      brick.kill()
      ball.setVelocity(ball.body!.velocity.x * -1, ball.body!.velocity.y * -1)
    })
  }

  reset() {
    super.reset(CONFIG.playerCount, 5, 1)
    this.resetBricks()
    this.resetPlayers()
  }

  resetPlayers = () => {
    this.playersEntries.forEach((p) => p.kill())
    for (let i = 0; i < CONFIG.playerCount; i++) {
      const network = this.neat.networks[i]
      this.players.get().spawn(network)
    }
  }

  nextGeneration() {
    super.nextGeneration()
    this.resetBricks()
    this.resetPlayers()
  }

  resetBricks = () => {
    this.brickEntries.forEach((p) => p.kill())
    for (let x = 65; x < this.cameras.main.width - 100; x += 90) {
      for (let y = 65; y < this.cameras.main.height / 3; y += 50) {
        const brick = this.bricks.get()
        brick?.spawn(x, y)
      }
    }
  }

  setupDatGUI = () => {
    super.setupDatGUI()
  }
}
