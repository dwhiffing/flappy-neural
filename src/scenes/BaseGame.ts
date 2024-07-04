import * as dat from 'dat.gui'
import { Scene } from 'phaser'
import { NEAT } from '../neat'

export class BaseGame extends Scene {
  generationCount: number
  currentScore: number
  bestScore: number
  playerCount: number
  neat: NEAT
  generationText: Phaser.GameObjects.Text
  currentScoreText: Phaser.GameObjects.Text
  bestScoreText: Phaser.GameObjects.Text
  isPlayMode: boolean
  inputCount: number
  outputCount: number
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  spaceKey: Phaser.Input.Keyboard.Key
  gui: dat.GUI

  constructor(sceneKey: string) {
    super(sceneKey)
    this.isPlayMode = false
    this.playerCount = 1
    this.inputCount = 1
    this.outputCount = 1
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.spaceKey = this.input.keyboard!.addKey('SPACE')
  }

  reset(playerCount?: number, inputCount?: number, outputCount?: number) {
    if (typeof playerCount === 'number') {
      this.playerCount = playerCount
    }
    if (typeof inputCount === 'number') {
      this.inputCount = inputCount
    }
    if (typeof outputCount === 'number') {
      this.outputCount = outputCount
    }
    this.data.set('generationCount', 0)
    this.data.set('currentScore', 0)
    this.data.set('bestScore', 0)
    this.neat = new NEAT(this.inputCount, this.outputCount, this.playerCount)
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

  setupDatGUI() {
    this.gui = new dat.GUI({ width: 300 })

    this.gui.add(this.time, 'timeScale', 1, 15, 1).onChange((c) => {
      this.physics.world.timeScale = 1 / c
      this.time.timeScale = c
    })

    this.gui.add(this, 'pause')
    this.gui.add(this, 'isPlayMode').onFinishChange(this.reset.bind(this))
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
