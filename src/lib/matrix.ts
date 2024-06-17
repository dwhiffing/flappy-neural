export type MatrixFunc = (v: number, i: number, j: number) => number
export type MatrixData = {
  rows: number
  cols: number
  data: number[][]
}

export class Matrix {
  rows: number
  cols: number
  data: number[][]

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.data = Array(this.rows)
      .fill(0)
      .map(() => Array(this.cols).fill(0))
  }

  static map(matrix: Matrix, func: MatrixFunc) {
    // Apply a function to every element of matrix
    return new Matrix(matrix.rows, matrix.cols).map((_, i, j) =>
      func(matrix.data[i][j], i, j),
    )
  }

  static fromArray(arr: number[]) {
    return new Matrix(arr.length, 1).map((_, i) => arr[i])
  }

  static subtract(a: Matrix, b: Matrix) {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      console.log('Columns and Rows of A must match Columns and Rows of B.')
      return a
    }

    // Return a new Matrix a-b
    return new Matrix(a.rows, a.cols).map(
      (_, i, j) => a.data[i][j] - b.data[i][j],
    )
  }

  static transpose(matrix: Matrix) {
    return new Matrix(matrix.cols, matrix.rows).map(
      (_, i, j) => matrix.data[j][i],
    )
  }

  static multiply(a: Matrix, b: Matrix) {
    // Matrix product
    if (a.cols !== b.rows) {
      console.log('Columns of A must match rows of B.')
      return a
    }

    return new Matrix(a.rows, b.cols).map((_, i, j) => {
      // Dot product of values in col
      let sum = 0
      for (let k = 0; k < a.cols; k++) {
        sum += a.data[i][k] * b.data[k][j]
      }
      return sum
    })
  }

  static deserialize(dataString: string) {
    const data = JSON.parse(dataString) as MatrixData
    let matrix = new Matrix(data.rows, data.cols)
    matrix.data = data.data
    return matrix
  }

  copy() {
    let m = new Matrix(this.rows, this.cols)
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        m.data[i][j] = this.data[i][j]
      }
    }
    return m
  }

  multiply(n: Matrix | number) {
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols) {
        console.log('Columns and Rows of A must match Columns and Rows of B.')
        return
      }

      // hadamard product
      return this.map((e, i, j) => e * n.data[i][j])
    } else {
      // Scalar product
      return this.map((e) => e * n)
    }
  }

  map(func: MatrixFunc) {
    // Apply a function to every element of matrix
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let val = this.data[i][j]
        this.data[i][j] = func(val, i, j)
      }
    }
    return this
  }

  randomize() {
    // randomize all values to range -1 -> +1
    return this.map(() => Math.random() * 2 - 1)
  }

  add(n: Matrix | number) {
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols) {
        console.log('Columns and Rows of A must match Columns and Rows of B.')
        return
      }
      return this.map((e, i, j) => e + n.data[i][j])
    } else {
      return this.map((e) => e + n)
    }
  }

  toArray() {
    let arr = []
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        arr.push(this.data[i][j])
      }
    }
    return arr
  }

  print = () => console.table(this.data)
  serialize = () => JSON.stringify(this)
}
