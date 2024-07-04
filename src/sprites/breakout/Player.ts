import { NeuralNetwork } from '../../neat'
import { Flappy } from '../../scenes/Flappy'

export class Player extends Phaser.Physics.Arcade.Sprite {
  network: NeuralNetwork
  declare scene: Flappy

  constructor(scene: Flappy) {
    super(scene, -999, -999, 'player')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setScale(5, 1)
  }

  spawn = (network = new NeuralNetwork(5, 1)) => {
    this.network = network
    this.setActive(true)
      .setVisible(true)
      .setVelocity(0)
      .setOrigin(0.5, 1)
      .setPosition(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height - 50,
      )
  }

  kill = () => {
    this.setActive(false)
      .setVisible(false)
      .setGravityY(0)
      .setVelocity(0)
      .setPosition(-999, -999)
  }

  update = () => {
    // if (this.y > this.scene.cameras.main.height * 1.2 || this.y < -50) {
    //   this.kill()
    // }

    // get more points the closer you are to the center of the pipe gap
    // const val = Math.abs(
    //   this.y / this.scene.cameras.main.height -
    //     (closest[1].y + CONFIG.pipeDistance / 2) /
    //       this.scene.cameras.main.height,
    // )
    const val = 0
    this.network.fitness += Math.max(0, 1 - val * 100)
    // const inputs = []
    // const output = this.network.predict(inputs)
    // if (output[0] > 0.5) {
    //   this.jump()
    // }
  }
}
