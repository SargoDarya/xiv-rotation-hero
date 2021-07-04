import {
  Rotation,
  User
} from './rotation-hero/interfaces';
import {RotationCreation, RotationUpdate} from './interfaces';

interface QueryParams<T> extends Object {
  sortBy?: keyof T
  page?: number
}

interface RotationQueryParams extends QueryParams<Rotation> {
  classJobId?: number;
}

interface FavouriteResponse {
  favouriteCount: number
}

export interface PaginatedResponse<T> {
  pagination: {
    page: number,
    pageTotal: number,
    pageNext: number | null,
    pagePrev: number | null,
    results: number,
    resultsPerPage: number,
    resultsTotal: number
  }
  results: T[]
}

export class API {
  private static readonly API_BASE_URL = 'https://api.xivrotationhero.com';
  // private static readonly API_BASE_URL = 'http://localhost:8083';

  // AUTH

  static async signIn(email: string, password: string) {
    return this.request('/auth/login', 'POST', JSON.stringify({ email, password }));
  }

  static async signUp(email: string, username: string, password: string) {
    return this.request('/auth/signup', 'POST', JSON.stringify({ email, password, username }));
  }

  static async me(): Promise<User> {
    return this.request('/auth/me', 'GET').then(response => response.json());
  }

  static async verify(token: string): Promise<Response> {
    return this.request(`/auth/verify/${token}`, 'POST');
  }

  static async logout() {
    return this.request('/auth/logout', 'GET');
  }

  // ROTATIONS
  static async createRotation(rotation: RotationCreation): Promise<Response> {
    return this.request('/rotation/', 'POST', JSON.stringify(rotation));
  }

  static async updateRotation(rotation: RotationUpdate): Promise<Response> {
    return this.request(`/rotation/${rotation.id}`, 'PATCH', JSON.stringify(rotation));
  }

  static async publishRotation(rotationId: string): Promise<Rotation> {
    return this.request(`/rotation/${rotationId}/publish`, 'POST').then(response => response.json());
  }

  static async favoriteRotation(rotationId: string): Promise<FavouriteResponse> {
    return this.request(`/rotation/${rotationId}/favourite`, 'POST', '').then(response => response.json());
  }

  static async favoriteRotationWithToken(rotationId: string, token: string): Promise<FavouriteResponse> {
    return this.request(`/rotation/${rotationId}/favourite/token/${token}`, 'POST', '').then(response => response.json());
  }

  static async getRotation(rotationId: string): Promise<Rotation> {
    return this.request(`/rotation/${rotationId}`, 'GET').then(response => response.json());
  }

  static async getAllRotations(queryParams: RotationQueryParams = {}): Promise<PaginatedResponse<Rotation>> {
    const paramArray = [];

    if (queryParams.page) {
      paramArray.push(`page=${queryParams.page}`);
    }
    if (queryParams.sortBy) {
      paramArray.push(`sortBy=${queryParams.sortBy}`);
    }
    if (queryParams.classJobId) {
      paramArray.push(`classJobId=${queryParams.classJobId}`);
    }

    const paramString = paramArray.length ? `?${paramArray.join('&')}` : '';

    return this.request(`/rotation/${ paramString }`, 'GET').then(response => response.json());
  }

  // USER
  static async userFavourites(): Promise<PaginatedResponse<Rotation>> {
    return this.request('/user/favourites', 'GET').then(response => response.json());
  }

  static async userRotations(): Promise<PaginatedResponse<Rotation>> {
    return this.request('/user/rotations', 'GET').then(response => response.json());
  }

  // Token
  static async userTokenFavourites(token: string): Promise<PaginatedResponse<Rotation>> {
    return this.request(`/token/${token}/favourites`, 'GET').then(response => response.json());
  }

  static async userTokenRotations(token: string): Promise<PaginatedResponse<Rotation>> {
    return this.request(`/token/${token}/rotations`, 'GET').then(response => response.json());
  }

  private static request(url: string, method: 'POST' | 'PATCH' | 'GET' | 'DELETE', body?: string, cache: boolean = false) {
    return fetch(`${this.API_BASE_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      cache: 'no-store',
      mode: 'cors',
      body
    });
  }
}
