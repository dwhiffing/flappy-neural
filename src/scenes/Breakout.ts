import { BREAKOUT_CONFIG as CONFIG } from '../constants'
import { Player } from '../sprites/breakout/Player'
import { Brick } from '../sprites/breakout/Brick'
import { BaseGame } from './BaseGame'
import { Ball } from '../sprites/breakout/Ball'

const BRICK_BASE_HEIGHT = 40
export class Breakout extends BaseGame {
  players: Phaser.GameObjects.Group
  bricks: Phaser.GameObjects.Group
  balls: Phaser.GameObjects.Group
  spawnEvent: Phaser.Time.TimerEvent

  constructor() {
    super('Breakout')
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
  }

  create() {
    super.create()
    this.physics.world.OVERLAP_BIAS = 32

    this.cameras.main.setBackgroundColor(0x000000)

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
    this.physics.world.on('worldbounds', (body: any) => {
      // if ball hits bottom of canvas, kill the player and its bricks, then check for next gen
      if (body.y === this.cameras.main.height - body.height) {
        const activePlayers = this.playersEntries.filter((p) => p.active)
        const activeBricks = this.brickEntries.filter((p) => p.active)
        const ball = body.gameObject
        ball.kill()
        activePlayers.find((p) => p.index === ball.index)?.kill()
        activeBricks
          .filter((b) => b.index === ball.index)
          ?.forEach((b) => b.kill())
        this.checkForNextGen()
      }
    })
  }

  update() {
    this.ballEntries
      .filter((p) => p.active)
      .forEach((ball) => {
        const player = this.playersEntries.find((p) => p.index === ball.index)!
        const bricks = this.brickEntries.filter(
          (b) => b.active && b.index === ball.index,
        )
        this.physics.collide(bricks, ball, (brick) =>
          this.onBallHitBrick(ball, brick as Brick, player),
        )
        this.physics.collide(player, ball, () =>
          this.onBallHitPlayer(ball, player),
        )
      })

    if (this.isPlayMode) {
      if (this.input.keyboard?.checkDown(this.cursors.left)) {
        this.playersEntries[0].left()
      } else if (this.input.keyboard?.checkDown(this.cursors.right)) {
        this.playersEntries[0].right()
      } else {
        this.playersEntries[0].halt()
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

    for (let i = 0; i < (this.isPlayMode ? 1 : CONFIG.playerCount); i++) {
      const network = this.neat.networks[i]

      this.players.get().spawn(i, network)
      this.balls.get().spawn(i)
      const cam = this.cameras.main
      const b = CONFIG.brickBuffer * CONFIG.brickSize
      const w = BRICK_BASE_HEIGHT * 2 * CONFIG.brickSize
      const h = BRICK_BASE_HEIGHT * CONFIG.brickSize
      const _x = ((cam.width % (w + b)) + b) / 2

      for (let x = _x; x < cam.width - w; x += w + b) {
        for (let y = b; y < cam.height / 3; y += h + b) {
          this.bricks.get().spawn(i, x, y)
        }
      }
    }
  }

  checkForNextGen() {
    if (this.playersEntries.filter((p) => p.active).length === 0) {
      this.nextGeneration()
    }
  }

  onBallHitBrick(ball: Ball, brick: Brick, player: Player) {
    brick.kill()
    this.data.inc('currentScore')

    if (player) {
      player.network.fitness += 500

      if (
        this.brickEntries.filter((b) => b.active && b.index === player.index)
          .length === 0
      ) {
        player.network.fitness += 50000
        player.kill()
        ball.kill()
        this.checkForNextGen()
      }
    }
  }
  onBallHitPlayer(ball: Ball, player: Player) {
    if (!player.body.touching.up) return
    if (player) player.network.fitness += 5000
    const ratio = (player.x - ball.x) / player.body.width + 0.5
    const range = [0 - CONFIG.bounceRatio, -Math.PI + CONFIG.bounceRatio]
    const angle = Phaser.Math.Interpolation.Linear(range, ratio)
    const { x, y } = ball.body.velocity
    const speed = Math.abs(Math.sqrt(x ** 2 + y ** 2))
    ball.setVelocity(
      Math.cos(angle) * speed,
      Math.min(Math.sin(angle) * speed, -150),
    )
  }

  nextGeneration() {
    super.nextGeneration()
    this.resetPlayers()
  }

  setupDatGUI = () => {
    super.setupDatGUI(1, 4)

    this.gui
      .add(CONFIG, 'brickSize', 1.5, 3, 0.5)
      .onFinishChange(this.reset.bind(this))

    this.gui
      .add(CONFIG, 'playerCount', 25, 300, 25)
      .onFinishChange(this.reset.bind(this))

    this.gui
      .add(CONFIG, 'ballSpeed', 10, 800, 25)
      .onFinishChange(this.reset.bind(this))

    this.gui
      .add(CONFIG, 'playerSpeed', 100, 800, 10)
      .onFinishChange(this.reset.bind(this))

    this.gui
      .add(CONFIG, 'playerSize', 10, 100, 10)
      .onFinishChange(this.reset.bind(this))
  }
}
