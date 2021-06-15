export interface Rotation {
  classJobId: number,
  description: string,
  favouriteCount: number,
  id: string,
  patch: string,
  phases: RotationPhase[],
  public: boolean,
  title: string
}

export interface RotationPhase {
  actions: number[],
  title: string,
  repeatable?: boolean
}
