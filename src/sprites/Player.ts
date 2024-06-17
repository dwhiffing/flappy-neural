import { CONFIG } from '../constants'
import { NeuralNetwork } from '../lib/neuralNetwork'
import { Game } from '../scenes/Game'
import { Pipe } from './Pipe'

export class Player extends Phaser.Physics.Arcade.Sprite {
  neuralNetwork: NeuralNetwork
  score: number
  declare scene: Game

  constructor(scene: Game) {
    super(scene, -999, -999, 'player')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setScale(6).setSize(5, 5).setOffset(5, 7)
  }

  spawn = (neuralNetwork = new NeuralNetwork(5, 5, 1)) => {
    this.neuralNetwork = neuralNetwork
    this.score = 0
    this.setActive(true)
      .setVisible(true)
      .setGravityY(CONFIG.gravity)
      .setVelocity(0)
      .setPosition(
        this.scene.cameras.main.width * 0.1,
        this.scene.cameras.main.height * 0.5,
      )
  }

  jump = () => {
    this.setVelocityY(CONFIG.jumpHeight)
  }

  kill = () => {
    this.setActive(false)
      .setVisible(false)
      .setGravityY(0)
      .setVelocity(0)
      .setPosition(-999, -999)
  }

  update = () => {
    const closest = (this.scene.pipes.children.entries as Pipe[])
      .filter((p) => p.active)
      .sort((a, b) => a.x - b.x)
      .slice(0, 2)

    if (closest.length < 2 || !this.active) return

    if (this.y > this.scene.cameras.main.height * 1.2 || this.y < -50) {
      this.kill()
    }

    this.score++

    const inputs = [
      this.y,
      this.body!.velocity.y,
      closest[0].y,
      closest[1].y,
      closest[0].x,
    ]

    const [result] = this.neuralNetwork.predict(inputs)

    if (result > 0.5) {
      this.jump()
    }
  }
}
