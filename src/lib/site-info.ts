/* Forma resuelta de la información del comercio que el sitio público
   muestra. Es la MISMA forma que la constante SITE (para que los
   consumidores casi no cambien), más los interruptores de métodos de pago.
   Este archivo es liviano y sin efectos: lo puede importar (como tipo)
   tanto el servidor como el cliente. */

export interface SiteInfo {
  name: string;
  tagline: string;
  description: string;
  url: string;
  owner: { name: string; role: string };
  contact: {
    address: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    phone: string;
    whatsapp: string;
    email: string;
    hours: string;
  };
  social: { instagram: string; facebook: string };
  maps: { embedSrc: string; link: string };
  /** Métodos de pago habilitados (editable desde Ajustes). */
  payment: {
    mercadopago: boolean;
    whatsapp: boolean;
    transfer: boolean;
    pickup_cash: boolean;
  };
}
