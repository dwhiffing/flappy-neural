import { Matrix, MatrixFunc } from './matrix'

const LEARNING_RATE = 0.1
export class NeuralNetwork {
  inputNodeCount: number
  hiddenNodeCount: number
  outputNodeCount: number
  weightsInputToHidden: Matrix
  weightsHiddenToOutput: Matrix
  biasHidden: Matrix
  biasOutput: Matrix
  activationFunction: (n: number) => number
  activationDeltaFunction: (n: number) => number
  constructor(
    input_nodesOrNetwork: NeuralNetwork | number,
    hiddenNodeCount?: number,
    outputNodeCount?: number,
  ) {
    // if network is passed as first arg, copy it
    if (input_nodesOrNetwork instanceof NeuralNetwork) {
      const network = input_nodesOrNetwork
      this.inputNodeCount = network.inputNodeCount
      this.hiddenNodeCount = network.hiddenNodeCount
      this.outputNodeCount = network.outputNodeCount

      this.weightsInputToHidden = network.weightsInputToHidden.copy()
      this.weightsHiddenToOutput = network.weightsHiddenToOutput.copy()

      this.biasHidden = network.biasHidden.copy()
      this.biasOutput = network.biasOutput.copy()
    } else {
      // else read node counts
      this.inputNodeCount = input_nodesOrNetwork
      this.hiddenNodeCount = hiddenNodeCount ?? 0
      this.outputNodeCount = outputNodeCount ?? 0

      this.weightsInputToHidden = new Matrix(
        this.hiddenNodeCount,
        this.inputNodeCount,
      )
      this.weightsHiddenToOutput = new Matrix(
        this.outputNodeCount,
        this.hiddenNodeCount,
      )
      this.weightsInputToHidden.randomize()
      this.weightsHiddenToOutput.randomize()

      this.biasHidden = new Matrix(this.hiddenNodeCount, 1)
      this.biasOutput = new Matrix(this.outputNodeCount, 1)
      this.biasHidden.randomize()
      this.biasOutput.randomize()
    }

    this.activationFunction = (x: number) => 1 / (1 + Math.exp(-x))
    this.activationDeltaFunction = (y: number) => y * (1 - y)
  }

  static deserialize(dataString: string) {
    const data = JSON.parse(dataString)
    const nn = new NeuralNetwork(
      data.inputNodeCount,
      data.hiddenNodeCount,
      data.outputNodeCount,
    )
    nn.weightsInputToHidden = Matrix.deserialize(data.weightsInputToHidden)
    nn.weightsHiddenToOutput = Matrix.deserialize(data.weightsHiddenToOutput)
    nn.biasHidden = Matrix.deserialize(data.biasHidden)
    nn.biasOutput = Matrix.deserialize(data.biasOutput)
    return nn
  }

  predict(input_array: number[]) {
    // Generating the Hidden Outputs
    const inputs = Matrix.fromArray(input_array)
    const hidden = Matrix.multiply(this.weightsInputToHidden, inputs)
    hidden.add(this.biasHidden)
    hidden.map(this.activationFunction)

    // Generating the output's output
    const output = Matrix.multiply(this.weightsHiddenToOutput, hidden)
    output.add(this.biasOutput)
    output.map(this.activationFunction)

    // Sending back to the caller
    return output.toArray()
  }

  // Randomize all the values by rate
  mutateByRate = (r = 0.1) => {
    this.mutate((v) => v + (Math.random() < r ? this.randomGaussian(0, r) : 0))
  }

  // Accept an arbitrary function for mutation
  mutate(func: MatrixFunc) {
    this.weightsInputToHidden.map(func)
    this.weightsHiddenToOutput.map(func)
    this.biasHidden.map(func)
    this.biasOutput.map(func)
  }

  copy = () => new NeuralNetwork(this)
  serialize = () => JSON.stringify(this)

  randomGaussian = (mean = 0, stdev = 1) => {
    const u = 1 - Math.random()
    const v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return z * stdev + mean
  }

  // IGNORE: not used for genetic algorithm
  train(input_array: number[], target_array: number[]) {
    // Generating the Hidden Outputs
    const inputs = Matrix.fromArray(input_array)
    const hidden = Matrix.multiply(this.weightsInputToHidden, inputs)
    hidden.add(this.biasHidden)
    hidden.map(this.activationFunction)

    // Generating the output's output
    const outputs = Matrix.multiply(this.weightsHiddenToOutput, hidden)
    outputs.add(this.biasOutput)
    outputs.map(this.activationFunction)

    // Convert array to matrix object
    const targets = Matrix.fromArray(target_array)

    // Calculate the error
    const output_errors = Matrix.subtract(targets, outputs)

    // Calculate gradient
    const gradients = Matrix.map(outputs, this.activationDeltaFunction)
    gradients.multiply(output_errors)
    gradients.multiply(LEARNING_RATE)

    // Calculate deltas
    const hidden_T = Matrix.transpose(hidden)
    const weight_ho_deltas = Matrix.multiply(gradients, hidden_T)

    // Adjust the weights by deltas
    this.weightsHiddenToOutput.add(weight_ho_deltas)
    // Adjust the bias by its deltas (which is just the gradients)
    this.biasOutput.add(gradients)

    // Calculate the hidden layer errors
    const who_t = Matrix.transpose(this.weightsHiddenToOutput)
    const hidden_errors = Matrix.multiply(who_t, output_errors)

    // Calculate hidden gradient
    const hidden_gradient = Matrix.map(hidden, this.activationDeltaFunction)
    hidden_gradient.multiply(hidden_errors)
    hidden_gradient.multiply(LEARNING_RATE)

    // Calcuate input->hidden deltas
    const inputs_T = Matrix.transpose(inputs)
    const weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T)

    this.weightsInputToHidden.add(weight_ih_deltas)
    // Adjust the bias by its deltas (which is just the gradients)
    this.biasHidden.add(hidden_gradient)
  }
}
