type Connection = {
  // some +/- float to determine the impact of this connection on the prediction
  weight: number
  // number of the input node of this connection
  inNode: number
  // number of the output node of this connection
  outNode: number
  // a connection can be disabled when a new node is added
  // when disabled, connections aren't considered when predicting
  enabled?: boolean
  // keeps track of connection history,
  // connections that came from the same parent will share a innovation number
  innovation?: number
}

// global innovation number
let innovation = 0

export class NeuralNetwork {
  // set of nodes in this network
  nodes: Set<number> = new Set()

  // connections between nodes in this network
  connections: Connection[] = []

  // the measured performance of this network, set externally as the network performs
  fitness: number = 0

  // sigmoid to apply when making predicts
  activationFunction = (n = 1) => 1 / (1 + Math.exp(-n))

  // initialize network with input/output nodes specified
  // and add connection with random weights
  constructor(public inSize: number, public outSize: number) {
    for (let i = 0; i < inSize; i++) {
      for (let o = inSize; o < inSize + outSize; o++) {
        const weight = rndBetween(-1, 1)
        this.addConnection({ inNode: i, outNode: o, weight })
      }
    }
  }

  addConnection(connection: Connection) {
    // give this connection a unique innovation number if it didn't inherit one from another connection
    if (typeof connection.innovation !== 'number') {
      connection.innovation = ++innovation
    }
    this.connections.push({ enabled: true, ...connection })
    this.nodes.add(connection.inNode)
    this.nodes.add(connection.outNode)
  }

  // predict output values given input values
  predict = (inputArray: number[]): number[] => {
    // convert input array to object
    const values: Record<number, number> = inputArray.reduce(
      (obj, v, i) => ({ ...obj, [i]: v }),
      {},
    )

    // for each connection, add the input/output and multiply by the weight, then put in output node
    this.connections.forEach((connection) => {
      if (connection.enabled) {
        const inputValue = values[connection.inNode] ?? 0
        const outputValue = values[connection.outNode] ?? 0
        values[connection.outNode] =
          outputValue + inputValue * connection.weight
      }
    })

    // apply sigmoid function to each non input node
    for (const node of this.nodes) {
      if (node >= this.inSize) {
        values[node] = this.activationFunction(values[node] ?? 0)
      }
    }

    // get the output values
    const output: number[] = []
    for (let i = this.inSize; i < this.inSize + this.outSize; i++) {
      output.push(values[i] ?? 0)
    }

    return output
  }
}

// Does not implement species, maybe another day
export class NEAT {
  // networks in the current population
  networks: NeuralNetwork[]

  // how many generations have there been
  generation: number = 0

  // mutations are very likely to help explore solution space
  mutateChance = 0.9

  // new connections are quite rare to keep network from growing too quickly
  addConnectionChance = 0.05

  // ditto for nodes
  addNewNodeChance = 0.03

  constructor(
    public inSize: number,
    public outSize: number,
    public popSize: number,
  ) {
    this.networks = Array.from(
      { length: popSize },
      () => new NeuralNetwork(inSize, outSize),
    )
  }

  // create new population by crossing over most fit networks and mutating randomly
  evolve() {
    const newGeneration: NeuralNetwork[] = []
    while (newGeneration.length < this.popSize) {
      // pick 2 random parents based on fitness
      const parent1 = this.weightedPick()
      const parent2 = this.weightedPick()

      // crossover the selected networks to produce a child
      const child = this.crossover(parent1, parent2)

      // randomly mutate weights, add nodes, or add connections
      if (rndBetween(0, 1) < this.mutateChance) {
        this.mutateConnectionWeight(child)
      }

      if (rndBetween(0, 1) < this.addNewNodeChance) {
        this.addNodeToNetwork(child)
      }

      if (rndBetween(0, 1) < this.addConnectionChance) {
        this.addConnectionToNetwork(child)
      }

      newGeneration.push(child)
    }

    this.networks = newGeneration
    this.generation++
  }

  // add a new node and connect it to a random existing node
  private addNodeToNetwork(network: NeuralNetwork) {
    const connection = sample(network.connections)
    if (!connection?.enabled) return

    connection.enabled = false

    const node = Math.max(...network.nodes) + 1
    network.nodes.add(node)
    network.addConnection({ ...connection, outNode: node, weight: 1 })
    network.addConnection({ ...connection, inNode: node })
  }

  // add a new connection to the network with a random input/output/weight
  private addConnectionToNetwork(network: NeuralNetwork) {
    const nodes = Array.from(network.nodes)
    const inNode = sample(nodes)
    const outNode = sample(nodes)

    // bail if we picked the same node twice or if the connection already exists
    if (
      inNode === outNode ||
      network.connections.some(
        (g) => g.inNode === inNode && g.outNode === outNode,
      )
    ) {
      return
    }

    const weight = rndBetween(-1, 1)
    network.addConnection({ inNode, outNode, weight })
  }

  // get a random connection and mutate one of its weights by 10%
  private mutateConnectionWeight(network: NeuralNetwork) {
    const connection = sample(network.connections)
    if (connection) connection.weight += rndBetween(-0.1, 0.1)
  }

  // crossover 2 networks, preferring connections from the stronger network
  private crossover(a: NeuralNetwork, b: NeuralNetwork): NeuralNetwork {
    if (b.fitness > a.fitness) {
      ;[a, b] = [b, a]
    }

    const child = new NeuralNetwork(a.inSize, a.outSize)

    const bConnections: Record<number, Connection> = b.connections.reduce(
      (obj, c) => ({ ...(obj ?? {}), [c.innovation ?? 0]: c }),
      {},
    )
    // child connections are inherited from a unless
    // b has a connection with a matching innovation number
    // then there is a 50% chance of it coming from either parent
    // this ensures that connections don't all just come from the more "fit" parent
    // by giving similar connections from the weaker parent another chance
    a.connections.forEach((existing) => {
      const matching = bConnections[existing.innovation ?? 0]

      child.addConnection(
        matching && rndBetween(0, 1) < 0.5 ? matching : existing,
      )
    })

    return child
  }

  // pick a random genome weighted based on fitness
  private weightedPick = () => {
    const genomes = this.networks.sort((a, b) => b.fitness - a.fitness)
    const totalFitness = genomes.reduce((s, f) => s + f.fitness, 0)
    const num = rndBetween(0, 1) * totalFitness
    let current = 0
    for (let i = 0; i < genomes.length; i++) {
      current += genomes[i].fitness
      if (current > num) return genomes[i]
    }
    return sample(genomes)
  }
}

const sample = (arr: any[]) => Phaser.Math.RND.pick(arr)
const rndBetween = (min = 0, max = 1) => Phaser.Math.RND.realInRange(min, max)
