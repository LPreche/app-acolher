import { apiFetch } from '@/services/api';

export interface ResumoLembretesResponse {
  dia_semana: number;
  dia_nome: string;
  tem_lembrete_hoje: boolean;
  pendentes_segunda_count: number;
  pendentes_sexta_count: number;
  notificacao: {
    titulo: string;
    corpo: string;
    quantidade: number;
    url: string;
  } | null;
}

export const notificacoesPush = {
  /**
   * Verifica se o navegador suporta notificações Web e Service Worker.
   */
  isSuportado(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator
    );
  },

  /**
   * Retorna o status atual de permissão.
   */
  obterStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (!this.isSuportado()) return 'unsupported';
    return Notification.permission;
  },

  /**
   * Registra o Service Worker do sistema.
   */
  async registrarServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSuportado()) return null;
    try {
      return await navigator.serviceWorker.register('/sw.js');
    } catch (err) {
      console.error('Erro ao registrar Service Worker:', err);
      return null;
    }
  },

  /**
   * Solicita permissão nativa, registra o Service Worker e salva a assinatura do celular no backend.
   */
  async solicitarPermissaoEAssinar(): Promise<boolean> {
    if (!this.isSuportado()) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      const reg = await this.registrarServiceWorker();
      if (!reg) return true;

      // Obtém ou cria a assinatura Push do aparelho
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
        }).catch(() => null);
      }

      // Envia o endpoint para o backend associar a este usuário logado
      if (subscription) {
        const subJson = subscription.toJSON();
        await apiFetch('/push-subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys_p256dh: subJson.keys?.p256dh || null,
            keys_auth: subJson.keys?.auth || null,
            device_name: navigator.userAgent.slice(0, 100),
          }),
        }).catch((err) => console.error('Erro ao registrar subscription no backend:', err));
      }

      return true;
    } catch (err) {
      console.error('Erro ao solicitar permissão de push:', err);
      return false;
    }
  },

  /**
   * Dispara uma notificação nativa no aparelho do usuário.
   */
  async enviarNotificacaoLocal(titulo: string, opcoes?: NotificationOptions): Promise<boolean> {
    if (!this.isSuportado() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg) {
        await reg.showNotification(titulo, {
          icon: '/logo-acolher.jpg',
          badge: '/icone-vertical.png',
          ...opcoes,
        });
        return true;
      } else {
        new Notification(titulo, {
          icon: '/logo-acolher.jpg',
          badge: '/icone-vertical.png',
          ...opcoes,
        });
        return true;
      }
    } catch (e) {
      console.error('Erro ao disparar notificação push:', e);
      return false;
    }
  },

  /**
   * Consulta os lembretes direcionados especificamente para o usuário logado e dispara o alerta do dia.
   */
  async verificarLembretesDirecionados(): Promise<ResumoLembretesResponse | null> {
    try {
      const resumo = await apiFetch<ResumoLembretesResponse>('/push/lembretes-usuario');

      if (resumo.tem_lembrete_hoje && resumo.notificacao && this.obterStatus() === 'granted') {
        const hojeStr = new Date().toISOString().split('T')[0];
        const chaveStorage = `acolher_lembrete_${hojeStr}`;

        // Dispara apenas 1 notificação push por dia no aparelho
        if (!localStorage.getItem(chaveStorage)) {
          await this.enviarNotificacaoLocal(resumo.notificacao.titulo, {
            body: resumo.notificacao.corpo,
            data: { url: resumo.notificacao.url },
          });
          localStorage.setItem(chaveStorage, 'true');
        }
      }

      return resumo;
    } catch (err) {
      console.error('Erro ao verificar lembretes direcionados:', err);
      return null;
    }
  },
};
