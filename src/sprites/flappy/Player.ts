import { FLAPPY_CONFIG as CONFIG } from '../../constants'
import { NeuralNetwork } from '../../neat'
import { Flappy } from '../../scenes/Flappy'
import { Pipe } from './Pipe'

export class Player extends Phaser.Physics.Arcade.Sprite {
  network?: NeuralNetwork
  declare scene: Flappy

  constructor(scene: Flappy) {
    super(scene, -999, -999, 'player')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setScale(6).setSize(5, 5).setOffset(5, 7)
  }

  spawn = (network?: NeuralNetwork) => {
    if (network) {
      this.network = network
    } else {
      this.network = undefined
    }
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
    if (!this.active) return

    const cam = this.scene.cameras.main

    if (this.y > cam.height * 1.2 || this.y < -50) {
      this.kill()
    }

    if (this.network) {
      const closest = (this.scene.pipes.children.entries as Pipe[])
        .filter((p) => p.active)
        .sort((a, b) => a.x - b.x)
        .slice(0, 2)
      if (closest.length < 2) return
      // get more points the closer you are to the center of the pipe gap
      const val = Math.abs(
        this.y / cam.height -
          (closest[1].y + CONFIG.pipeDistance / 2) / cam.height,
      )
      this.network.fitness += Math.max(0, 1 - val * 100)

      const inputs = [
        this.y / cam.height,
        closest[1].y / cam.height,
        closest[0].y / cam.height,
        closest[0].x / cam.width,
        this.body!.velocity.y / 1000,
      ]

      const output = this.network.predict(inputs)
      if (output[0] > 0.5) {
        this.jump()
      }
    }
  }
}
