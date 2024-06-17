import { GRAVITY, JUMP_VELOCITY } from '../constants'
import { NeuralNetwork } from '../lib/nn'
import { Game } from '../scenes/Game'
import { Pipe } from './Pipe'

export class Player extends Phaser.Physics.Arcade.Sprite {
  neuralNetwork: NeuralNetwork
  declare scene: Game
  constructor(scene: Game) {
    super(
      scene,
      scene.cameras.main.width * 0.1,
      scene.cameras.main.height * 0.5,
      'player',
    )
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setGravityY(GRAVITY).setScale(6).setSize(5, 5).setOffset(5, 7)

    this.neuralNetwork = new NeuralNetwork(4, 4, 1)
  }

  jump = () => {
    this.setVelocityY(JUMP_VELOCITY)
  }

  die = () => {
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

    if (closest.length < 2) return

    const inputs = [this.y, closest[0].y, closest[1].y, closest[0].x]

    const [result] = this.neuralNetwork.predict(inputs)

    if (result > 0.5) {
      this.jump()
    }
  }
}
