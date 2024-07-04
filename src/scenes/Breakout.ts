import { BREAKOUT_CONFIG as CONFIG } from '../constants'
import { Player } from '../sprites/breakout/Player'
import { Brick } from '../sprites/breakout/Brick'
import { BaseGame } from './BaseGame'
import { Ball } from '../sprites/breakout/Ball'

export class Breakout extends BaseGame {
  players: Phaser.GameObjects.Group
  bricks: Phaser.GameObjects.Group
  balls: Phaser.GameObjects.Group
  spawnEvent: Phaser.Time.TimerEvent

  constructor() {
    super('Breakout')
    // this.isPlayMode = true
  }

  get playersEntries() {
    return this.players.children.entries as Player[]
  }

  get ballEntries() {
    return this.balls.children.entries as Ball[]
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

    this.balls = this.add.group({
      classType: Ball,
      maxSize: 1000,
      runChildUpdate: true,
    })

    this.players = this.add.group({
      classType: Player,
      maxSize: 1000,
      runChildUpdate: true,
    })
    this.bricks = this.add.group({ classType: Brick, maxSize: 20 * 1000 })

    this.reset()
    this.setupUI()
    this.setupDatGUI()
  }

  update() {
    const activePlayers = this.playersEntries.filter((p) => p.active)
    const activeBalls = this.ballEntries.filter((p) => p.active)

    for (let ball of activeBalls) {
      if (ball.y > this.cameras.main.height - 50) {
        ball.kill()
        activePlayers.find((p) => p.index === ball.index)?.kill()
        if (this.playersEntries.filter((p) => p.active).length === 0) {
          this.nextGeneration()
          return
        }
      }
    }

    this.physics.collide(this.bricks, this.balls, (_brick) => {
      const brick = _brick as Brick
      brick.kill()
      this.data.inc('currentScore')
    })

    this.physics.collide(this.players, this.balls, (_player, _ball) => {
      const player = _player as Player
      const ball = _ball as Phaser.Physics.Arcade.Sprite

      if (player.body.touching.up) {
        const positionRatio = (player.x - ball.x) / player.body.width + 0.5
        const angle = Phaser.Math.Angle.Wrap(
          Phaser.Math.Interpolation.Linear(
            [0 - CONFIG.bounceRatio, -Math.PI + CONFIG.bounceRatio],
            positionRatio,
          ),
        )
        const speed = Math.abs(
          Math.sqrt(ball.body!.velocity.x ** 2 + ball.body!.velocity.y ** 2),
        )
        ball.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
      }
    })

    if (this.isPlayMode) {
      if (this.input.keyboard?.checkDown(this.cursors.left)) {
        activePlayers[0].left()
      } else if (this.input.keyboard?.checkDown(this.cursors.right)) {
        activePlayers[0].right()
      } else {
        activePlayers[0].halt()
      }
    }
  }

  reset() {
    super.reset(CONFIG.playerCount, 5, 1)
    this.resetPlayers()
  }

  resetPlayers = () => {
    this.ballEntries.forEach((b) => b.kill())
    this.playersEntries.forEach((p) => p.kill())
    this.brickEntries.forEach((p) => p.kill())

    for (let i = 0; i < CONFIG.playerCount; i++) {
      const network = this.neat.networks[i]

      this.players.get().spawn(i + 1, network)
      this.balls.get().spawn(i + 1)

      for (let x = 65; x < this.cameras.main.width - 100; x += 90) {
        for (let y = 65; y < this.cameras.main.height / 3; y += 50) {
          this.bricks.get().spawn(i + 1, x, y)
        }
      }
    }
  }

  nextGeneration() {
    super.nextGeneration()
    this.resetPlayers()
  }

  setupDatGUI = () => {
    super.setupDatGUI()
  }
}
