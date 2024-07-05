import { BREAKOUT_CONFIG as CONFIG } from '../../constants'
import { Scene } from 'phaser'
import { TINTS } from '../../constants'

export class Ball extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body
  index: number

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'brick')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setScale(0.5).setBounce(1).setCollideWorldBounds(true, 1, 1, true)
  }

  spawn(index: number) {
    this.index = index
    this.setVelocity(
      Phaser.Math.Between(-500, 500),
      -CONFIG.ballSpeed,
    ).setPosition(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 1.2,
    )
    this.setTint(TINTS[index % TINTS.length])
    this.setActive(true)
    this.setVisible(true)
  }

  kill() {
    this.setVelocity(0).setPosition(-999, -999)
    this.setActive(false)
    this.setVisible(false)
  }
}
