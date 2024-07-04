import { FLAPPY_CONFIG as CONFIG } from '../constants'
import { Player } from '../sprites/flappy/Player'
import { Pipe } from '../sprites/flappy/Pipe'
import { BaseGame } from './BaseGame'

export class Flappy extends BaseGame {
  players: Phaser.GameObjects.Group
  pipes: Phaser.GameObjects.Group
  spawnEvent: Phaser.Time.TimerEvent

  constructor() {
    super('Flappy')
  }

  get playersEntries() {
    return this.players.children.entries as Player[]
  }

  get pipesEntries() {
    return this.pipes.children.entries as Pipe[]
  }

  preload() {
    this.load.setPath('assets')
    this.load.image('player', 'player.png')
    this.load.image('pipe', 'pipe.png')
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

    this.players = this.add.group({
      classType: Player,
      maxSize: 1000,
      runChildUpdate: true,
    })
    this.pipes = this.add.group({ classType: Pipe, maxSize: 50 })

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

    // kill colliding players
    this.physics.overlap(this.players, this.pipes, (_player) => {
      const player = _player as Player
      player.kill()
    })

    // kill out of bounds pipes, increase score
    for (let _pipe of this.pipes.children.entries) {
      const pipe = _pipe as Pipe
      if (pipe.active && pipe.x < -50) {
        pipe.kill()
        this.data.inc('currentScore', 0.5)
      }
    }

    if (this.isPlayMode && this.input.keyboard?.checkDown(this.spaceKey, 100)) {
      activePlayers[0].jump()
    }
  }

  reset() {
    super.reset(CONFIG.playerCount, 5, 1)
    this.resetPipes()
    this.resetPlayers()
  }

  spawnPipe = () => {
    const h = this.cameras.main.height
    const y = Phaser.Math.RND.between(h * 0.2, h * 0.8)
    this.pipes.get().spawn(y + CONFIG.pipeDistance, CONFIG.pipeSpeed, 0)
    this.pipes.get().spawn(y - CONFIG.pipeDistance, CONFIG.pipeSpeed, 1)
  }

  resetPlayers = () => {
    this.playersEntries.forEach((p) => p.kill())
    if (this.isPlayMode) {
      this.players.get().spawn()
      return
    }
    for (let i = 0; i < CONFIG.playerCount; i++) {
      const network = this.neat.networks[i]
      this.players.get().spawn(network)
    }
  }

  nextGeneration() {
    super.nextGeneration()
    this.resetPipes()
    this.resetPlayers()
  }

  resetPipes = () => {
    this.pipesEntries.forEach((p) => p.kill())
    this.spawnEvent?.destroy()
    this.spawnEvent = this.time.addEvent({
      delay: CONFIG.pipeDelay,
      startAt: CONFIG.pipeDelay,
      repeat: -1,
      callback: this.spawnPipe,
    })
  }

  setupDatGUI() {
    super.setupDatGUI()

    this.gui
      .add(CONFIG, 'gravity', 200, 3200, 150)
      .onFinishChange(this.reset.bind(this))
    this.gui
      .add(CONFIG, 'jumpHeight', -1000, -200, 50)
      .onFinishChange(this.reset.bind(this))
    this.gui
      .add(CONFIG, 'pipeSpeed', 50, 1000, 50)
      .onFinishChange(this.reset.bind(this))
    this.gui
      .add(CONFIG, 'playerCount', 10, 1000, 10)
      .onFinishChange(this.reset.bind(this))
    this.gui
      .add(CONFIG, 'pipeDelay', 1000, 4000, 500)
      .onFinishChange(this.reset.bind(this))
    this.gui
      .add(CONFIG, 'pipeDistance', 50, 200, 10)
      .onFinishChange(this.reset.bind(this))
  }
}
