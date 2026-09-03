function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL_FRONT ||
    process.env.API_URL_FRONT;

  if (url) {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  // No navegador (seja ngrok, celular ou localhost), usa a rota relativa '/api'
  // O Next.js se encarrega de repassar diretamente ao Laravel local na porta 8000
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://127.0.0.1:8000/api';
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
    const errorMessage = data?.message || data?.mensagem || 'Ocorreu um erro na requisição.';
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}
