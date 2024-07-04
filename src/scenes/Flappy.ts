import { Scene } from 'phaser'
import { CONFIG } from '../constants'
import { Player } from '../sprites/Player'
import { Pipe } from '../sprites/Pipe'
import * as dat from 'dat.gui'
import { NEAT } from '../neat'

export class Flappy extends Scene {
  players: Phaser.GameObjects.Group
  pipes: Phaser.GameObjects.Group
  spawnEvent: Phaser.Time.TimerEvent
  generationCount: number
  currentScore: number
  bestScore: number
  neat: NEAT
  generationText: Phaser.GameObjects.Text
  currentScoreText: Phaser.GameObjects.Text
  bestScoreText: Phaser.GameObjects.Text
  gui: dat.GUI

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
        this.data.inc('currentScore')
      }
    }
  }

  reset = () => {
    this.data.set('generationCount', 0)
    this.data.set('currentScore', 0)
    this.data.set('bestScore', 0)
    this.neat = new NEAT(5, 1, CONFIG.playerCount)
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
    for (let i = 0; i < CONFIG.playerCount; i++) {
      const network = this.neat.networks[i]
      this.players.get().spawn(network)
    }
  }

  nextGeneration = () => {
    if (this.data.values.currentScore > this.data.values.bestScore) {
      this.data.set('bestScore', this.data.values.currentScore)
    }
    this.data.set('currentScore', 0)
    this.data.inc('generationCount')

    this.neat.evolve()
    this.resetPipes()
    this.resetPlayers()
  }

  getPlayersWithFitness = () =>
    this.playersEntries
      .map((p) => ({ player: p, fitness: p.network.fitness }))
      .sort((a, b) => b.fitness - a.fitness)

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

  pause = () => {
    if (this.scene.isPaused()) {
      this.scene.resume()
    } else {
      this.scene.pause()
    }
  }

  setupUI = () => {
    this.data.events.on('changedata', (_: any, key: string, number: number) => {
      if (key === 'generationCount')
        this.generationText.setText(`Generation: ${number}`)

      // each pipe set counts as 2 points, so we divide by 2 here to normalize
      if (key === 'currentScore')
        this.currentScoreText.setText(`Score: ${number / 2}`)
      if (key === 'bestScore') this.bestScoreText.setText(`Best: ${number / 2}`)
    })

    let y = 650
    let x = this.cameras.main.width - 20

    this.generationText = this.add
      .text(x, y, 'Generation: 0')
      .setDepth(999)
      .setFontSize(32)
      .setOrigin(1, 0.5)

    this.currentScoreText = this.add
      .text(x, y + 40, 'Score: 0')
      .setDepth(999)
      .setFontSize(32)
      .setOrigin(1, 0.5)

    this.bestScoreText = this.add
      .text(x, y + 80, 'Best: 0')
      .setDepth(999)
      .setFontSize(32)
      .setOrigin(1, 0.5)

    this.gui = new dat.GUI({ width: 300 })

    this.gui.add(this.time, 'timeScale', 1, 15, 1).onChange((c) => {
      this.physics.world.timeScale = 1 / c
      this.time.timeScale = c
    })

    this.gui.add(CONFIG, 'gravity', 200, 3200, 150).onFinishChange(this.reset)
    this.gui
      .add(CONFIG, 'jumpHeight', -1000, -200, 50)
      .onFinishChange(this.reset)
    this.gui.add(CONFIG, 'pipeSpeed', 50, 1000, 50).onFinishChange(this.reset)
    this.gui.add(CONFIG, 'playerCount', 10, 1000, 10).onFinishChange(this.reset)
    this.gui
      .add(CONFIG, 'pipeDelay', 1000, 4000, 500)
      .onFinishChange(this.reset)
    this.gui.add(CONFIG, 'pipeDistance', 50, 200, 10).onFinishChange(this.reset)

    this.gui.add(this, 'logBestPlayer')
    this.gui.add(this, 'pause')
  }

  logBestPlayer = () => {
    const bestPlayer = this.getPlayersWithFitness()?.[0]?.player
    console.log(bestPlayer.network)
  }
}
