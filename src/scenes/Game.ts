import { Scene } from 'phaser'
import { TIMESCALE, PIPE_DELAY, PIPE_SPEED } from '../constants'
import { Player } from '../sprites/Player'
import { Pipe } from '../sprites/Pipe'

export class Game extends Scene {
  players: Phaser.GameObjects.Group
  pipes: Phaser.GameObjects.Group
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
    const w = this.cameras.main.width
    const h = this.cameras.main.height
    this.time.timeScale = TIMESCALE
    this.physics.world.timeScale = 1 / TIMESCALE

    this.add.image(w / 2, h / 2, 'background')
    this.players = this.add.group({
      classType: Player,
      maxSize: 1000,
      runChildUpdate: true,
    })

    this.pipes = this.add.group({ classType: Pipe, maxSize: 10 })

    this.time.addEvent({
      delay: PIPE_DELAY,
      startAt: PIPE_DELAY,
      repeat: -1,
      callback: this.spawnPipe,
    })

    for (let i = 0; i < 1000; i++) {
      this.players.get()
    }
  }

  spawnPipe = () => {
    const h = this.cameras.main.height
    const y = Phaser.Math.RND.between(h * 0.2, h * 0.8)
    this.pipes.get().spawn(y + 100, PIPE_SPEED, 0)
    this.pipes.get().spawn(y - 100, PIPE_SPEED, 1)
  }

  update() {
    const players = this.players.children.entries as Player[]
    players.forEach((player) => {
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
