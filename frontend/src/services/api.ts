function getApiBaseUrl(): string {
  // 1. Variável de ambiente configurada
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL_FRONT ||
    process.env.API_URL_FRONT;

  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }

  // 2. Ambiente local de desenvolvimento no navegador
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/api';
    }
  }

  // 3. Produção (Vercel): Aponta direto para o backend no Render
  return 'https://app-acolher.onrender.com/api';
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Anexa o token Sanctum se existir no localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('acolher_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Trata erro 401 (não autorizado)
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('acolher_token');
    localStorage.removeItem('acolher_usuario');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = data?.mensagem || data?.message;

    if (data?.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
        errorMessage = data.errors[firstKey][0];
      }
    }

    throw new ApiError(errorMessage || 'Ocorreu um erro na requisição.', response.status, data);
  }

  return data as T;
}
