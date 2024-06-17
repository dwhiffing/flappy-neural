import { Scene } from 'phaser'
import {
  PIPE_DELAY,
  PIPE_SPEED,
  PLAYER_COUNT,
  MUTATION_RATE,
  PIPE_DISTANCE,
} from '../constants'
import { Player } from '../sprites/Player'
import { Pipe } from '../sprites/Pipe'
import * as dat from 'dat.gui'

export class Game extends Scene {
  players: Phaser.GameObjects.Group
  pipes: Phaser.GameObjects.Group
  spawnEvent: Phaser.Time.TimerEvent
  generationCount: number
  generationText: Phaser.GameObjects.Text

  constructor() {
    super('Game')
  }

  preload() {
    this.load.setPath('assets')

    this.load.image('player', 'player.png')
    this.load.image('pipe', 'pipe.png')
    this.load.image('background', 'bg.png')
  }

  create() {
    const gui = new dat.GUI({ width: 400 })

    gui.add(this.time, 'timeScale', 1, 15, 1).onChange((c) => {
      this.physics.world.timeScale = 1 / c
      this.time.timeScale = c
    })

    const w = this.cameras.main.width
    const h = this.cameras.main.height

    this.add.image(w / 2, h / 2, 'background')
    this.players = this.add.group({
      classType: Player,
      maxSize: PLAYER_COUNT,
      runChildUpdate: true,
    })

    this.generationCount = 0

    this.pipes = this.add.group({ classType: Pipe, maxSize: 50 })

    this.generationText = this.add
      .text(this.cameras.main.width - 5, 20, 'Generation 0')
      .setDepth(999)
      .setOrigin(1, 0.5)

    this.nextGeneration()
  }

  nextGeneration = () => {
    const pipes = this.pipes.children.entries as Pipe[]
    const players = this.players.children.entries as Player[]
    const totalScore = players.reduce((sum, p) => sum + p.score, 0)
    const playersWithFitness = players.map((p) => ({
      player: p,
      fitness: p.score / totalScore,
    }))
    const playersSortedByFitness = playersWithFitness.sort(
      (a, b) => b.fitness - a.fitness,
    )
    const mostFitPlayer = playersSortedByFitness?.[0]?.player
    for (let i = 0; i < PLAYER_COUNT; i++) {
      const r = MUTATION_RATE
      const neuralNetwork = mostFitPlayer?.neuralNetwork.mutate(
        (v) => v + (Math.random() < r ? randomGaussian(0, r) : 0),
      )
      this.players.get().spawn(neuralNetwork)
    }

    pipes.forEach((p) => p.kill())
    this.spawnEvent?.destroy()
    this.spawnEvent = this.time.addEvent({
      delay: PIPE_DELAY,
      startAt: PIPE_DELAY,
      repeat: -1,
      callback: this.spawnPipe,
    })
    this.generationCount++
    this.generationText.setText(`Generation ${this.generationCount}`)
  }

  spawnPipe = () => {
    const h = this.cameras.main.height
    const y = Phaser.Math.RND.between(h * 0.2, h * 0.8)
    this.pipes.get().spawn(y + PIPE_DISTANCE, PIPE_SPEED, 0)
    this.pipes.get().spawn(y - PIPE_DISTANCE, PIPE_SPEED, 1)
  }

  update() {
    const players = this.players.children.entries as Player[]

    if (players.every((p) => !p.active)) {
      this.nextGeneration()
    } else {
      players
        .filter((p) => p.active)
        .forEach((player) => {
          if (player.y > this.cameras.main.height * 1.2 || player.y < -50) {
            player.die()
          }
        })

      this.physics.overlap(this.players, this.pipes, (_player) => {
        const player = _player as Player
        player.die()
      })

      for (let _pipe of this.pipes.children.entries) {
        const pipe = _pipe as Pipe
        if (pipe.active && pipe.x < -50) {
          pipe.kill()
        }
      }
    }
  }
}

function randomGaussian(mean = 0, stdev = 1) {
  const u = 1 - Math.random() // Converting [0,1) to (0,1]
  const v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean
}
