declare module 'subtender/poi' {
  export function shipRemodelInfoSelector(_: any): {
    originMstIdOf: { [_: number]: number },
    remodelChains: number[]
  }
}
