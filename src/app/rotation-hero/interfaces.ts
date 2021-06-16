export interface UserShort {
  id: string,
  username: string
}

export interface User extends UserShort {
  uniqueToken: string,
  email: string
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserSignIn {
  email: string;
  password: string;
}

export interface Rotation {
  classJobId: number,
  description: string,
  favouriteCount: number,
  id: string,
  patch: string,
  phases: RotationPhase[],
  public: boolean,
  title: string,
  user: UserShort
}

export interface RotationPhase {
  actions: number[],
  title: string,
  repeatable?: boolean
}
