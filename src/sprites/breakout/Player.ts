import { BREAKOUT_CONFIG as CONFIG } from '../../constants'
import { NeuralNetwork } from '../../neat'
import { Breakout } from '../../scenes/Breakout'

export class Player extends Phaser.Physics.Arcade.Sprite {
  network: NeuralNetwork
  index: number
  declare scene: Breakout
  declare body: Phaser.Physics.Arcade.Body

  constructor(scene: Breakout) {
    super(scene, -999, -999, 'player')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setScale(5, 1).setImmovable(true).setOrigin(0.5, 1)
    // this.setAlpha(0.5)
  }

  spawn = (index: number, network = new NeuralNetwork(5, 1)) => {
    this.network = network
    this.index = index
    this.setCollidesWith(index)
    this.setActive(true)
      .setVisible(true)
      .setVelocity(0)
      .setPosition(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height - 50,
      )
  }

  kill = () => {
    this.setActive(false)
      .setVisible(false)
      .setVelocity(0)
      .setPosition(-999, -999)
  }

  left() {
    this.setVelocityX(-CONFIG.playerSpeed)
  }

  right() {
    this.setVelocityX(CONFIG.playerSpeed)
  }

  halt() {
    this.setVelocityX(0)
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
    // const val = 0
    // this.network.fitness += Math.max(0, 1 - val * 100)
    // const inputs = []
    // const output = this.network.predict(inputs)
    // if (output[0] > 0.5) {
    //   this.jump()
    // }
  }
}
