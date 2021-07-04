import {PhaseEnum, PublishState} from './enums';

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
  createdAt: string,
  description: string,
  favouriteCount: number,
  id: string,
  patch: string,
  phases: RotationPhase[],
  publishState: PublishState,
  title: string,
  user: UserShort
}

export interface RotationPhase {
  actions: number[],
  phase: PhaseEnum
}
