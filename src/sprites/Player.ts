import { CONFIG } from '../constants'
import { NeuralNetwork } from '../neat'
import { Flappy } from '../scenes/Flappy'
import { Pipe } from './Pipe'

export class Player extends Phaser.Physics.Arcade.Sprite {
  network: NeuralNetwork
  declare scene: Flappy

  constructor(scene: Flappy) {
    super(scene, -999, -999, 'player')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setScale(6).setSize(5, 5).setOffset(5, 7)
  }

  spawn = (network = new NeuralNetwork(5, 1)) => {
    this.network = network
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

    // get more points the closer you are to the center of the pipe gap
    const val = Math.abs(
      this.y / this.scene.cameras.main.height -
        (closest[1].y + CONFIG.pipeDistance / 2) /
          this.scene.cameras.main.height,
    )

    this.network.fitness += Math.max(0, 1 - val * 100)

    const inputs = [
      this.y / this.scene.cameras.main.height,
      closest[1].y / this.scene.cameras.main.height,
      closest[0].y / this.scene.cameras.main.height,
      closest[0].x / this.scene.cameras.main.width,
      this.body!.velocity.y / 1000,
    ]

    const output = this.network.predict(inputs)
    if (output[0] > 0.5) {
      this.jump()
    }
  }
}
