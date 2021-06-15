import { Rotation } from './rotation-hero/interfaces';

export class API {
  private static readonly API_BASE_URL = 'https://api.xivrotationhero.com';

  // AUTH

  static async signIn(email: string, password: string) {
    return this.request('/auth/signIn', 'POST', JSON.stringify({ email, password })).then(response => response.json());
  }

  static async signInWithToken(token: string) {
    return this.request('/auth/token', 'POST', JSON.stringify({ token })).then(response => response.json());
  }

  static async logout() {
    return this.request('/auth/token', 'GET');
  }

  // ROTATIONS
  static async createRotation(rotation: any): Promise<Rotation> {
    return this.request('/rotation/', 'POST', JSON.stringify(rotation)).then(response => response.json());
  }

  static async publishRotation(rotationId: string): Promise<Rotation> {
    return this.request(`/rotation/${rotationId}/publish`, 'POST').then(response => response.json());
  }

  static async favoriteRotation(rotationId: string): Promise<string> {
    return this.request(`/rotation/${rotationId}/favourite`, 'POST', '').then(response => response.text());
  }

  static async getRotation(rotationId: string): Promise<Rotation> {
    return this.request(`/rotation/${rotationId}`, 'GET').then(response => response.json());
  }

  static async getAllRotations(pageOffset: number = 0): Promise<Rotation[]> {
    return this.request(`/rotation/`, 'GET').then(response => response.json());
  }

  // USER
  static async userFavourites() {
    return this.request('/user/favourites', 'GET').then(response => response.json());
  }

  static async userRotations() {
    return this.request('/user/rotations', 'GET').then(response => response.json());
  }

  // Token
  static async userTokenFavourites(token: string) {
    return this.request(`/token/${token}/favourites`, 'GET').then(response => response.json());
  }

  static async userTokenRotations(token: string) {
    return this.request(`/token/${token}/rotations`, 'GET').then(response => response.json());
  }

  private static request(url: string, method: 'POST' | 'GET' | 'DELETE', body?: string, cache: boolean = false) {
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
