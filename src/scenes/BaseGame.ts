import { Scene } from 'phaser'
import { NEAT } from '../neat'

export class BaseGame extends Scene {
  generationCount: number
  currentScore: number
  bestScore: number
  neat: NEAT
  generationText: Phaser.GameObjects.Text
  currentScoreText: Phaser.GameObjects.Text
  bestScoreText: Phaser.GameObjects.Text

  constructor(sceneKey: string) {
    super(sceneKey)
  }

  reset(playerCount: number) {
    this.data.set('generationCount', 0)
    this.data.set('currentScore', 0)
    this.data.set('bestScore', 0)
    this.neat = new NEAT(5, 1, playerCount)
  }

  nextGeneration() {
    if (this.data.values.currentScore > this.data.values.bestScore) {
      this.data.set('bestScore', this.data.values.currentScore)
    }
    this.data.set('currentScore', 0)
    this.data.inc('generationCount')

    this.neat.evolve()
  }

  pause = () => {
    if (this.scene.isPaused()) {
      this.scene.resume()
    } else {
      this.scene.pause()
    }
  }

  setupUIElement = (
    x: number,
    y: number,
    key: string,
    getText: (n: number) => string,
  ) => {
    const text = this.add
      .text(x, y, getText(0))
      .setDepth(999)
      .setFontSize(32)
      .setOrigin(1, 0.5)

    this.data.events.on(
      'changedata',
      (_: any, _key: string, number: number) => {
        if (_key === key) text.setText(getText(number))
      },
    )

    return text
  }

  setupUI = () => {
    let y = this.cameras.main.height - 40
    let x = this.cameras.main.width - 20

    this.setupUIElement(x, y - 80, 'generationCount', (n) => `Generation: ${n}`)
    this.setupUIElement(x, y - 40, 'currentScore', (n) => `Score: ${n / 2}`)
    this.setupUIElement(x, y, 'bestScore', (n) => `Best: ${n / 2}`)
  }
}
