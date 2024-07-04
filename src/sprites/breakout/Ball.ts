import { Scene } from 'phaser'

export class Ball extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body
  index: number

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'brick')
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setScale(0.5).setBounce(1).setCollideWorldBounds(true)
    // this.setAlpha(0.5)
  }

  spawn(index: number) {
    this.index = index
    this.setVelocity(0, 500).setPosition(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
    )
    this.setCollidesWith(index)
    this.setActive(true)
    this.setVisible(true)
  }

  kill() {
    this.x = -999
    this.y = -999
    this.setVelocityX(0)
    this.setActive(false)
    this.setVisible(false)
  }
}
