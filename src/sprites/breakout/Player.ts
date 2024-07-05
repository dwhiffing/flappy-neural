import { BREAKOUT_CONFIG as CONFIG, TINTS } from '../../constants'
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
    this.setImmovable(true).setOrigin(0.5, 1)
  }

  spawn = (index: number, network = new NeuralNetwork(5, 1)) => {
    this.network = network
    this.index = index
    this.setTint(TINTS[index % TINTS.length])
    this.setActive(true)
      .setVisible(true)
      .setScale(CONFIG.playerSize / 10, 1)
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
    if (this.x > this.body.width / 1.75) {
      this.setVelocityX(-CONFIG.playerSpeed)
    } else {
      this.halt()
    }
  }

  right() {
    if (this.x < this.scene.cameras.main.width - this.body.width / 1.75) {
      this.setVelocityX(CONFIG.playerSpeed)
    } else {
      this.halt()
    }
  }

  halt() {
    this.setVelocityX(0)
  }

  update = () => {
    if (!this.active || this.scene.isPlayMode) return

    const cam = this.scene.cameras.main
    const ball = this.scene.ballEntries.find((b) => b.index === this.index)!
    const inputs = [
      this.x / cam.width,
      ball.x / cam.width,
      ball.y / cam.height,
      ball.body.velocity.x / 1000,
      ball.body.velocity.y / 1000,
    ]
    const pl = this.x - this.body.width / 2
    const pr = this.x + this.body.width / 2
    const val = ball.x > pl && ball.x < pr ? 1 : 0
    const val2 = (1 - Math.abs(ball.x / cam.width - this.x / cam.width)) / 100

    this.network.fitness += val2 + val
    const output = this.network.predict(inputs)
    if (output[0] < 0.5) {
      this.left()
    } else {
      this.right()
    }
  }
}
