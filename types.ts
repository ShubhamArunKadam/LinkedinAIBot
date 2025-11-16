
export interface AppState {
  trend: string | null;
  post: string | null;
  imageUrl: string | null;
  error: string | null;
  step: number;
  copied: boolean;
}

export interface LoadingState {
  trend: boolean;
  post: boolean;
  image: boolean;
}
