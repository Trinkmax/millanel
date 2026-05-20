export const SITE = {
  name: "Millanel Frías",
  brand: "millanel",
  tagline: "Perfumería · Cosmética · Cuidado personal",
  description:
    "Distribuidora oficial Millanel en Frías, Santiago del Estero. Una experiencia perfumada con identidad propia.",
  url: "https://millanel-frias.vercel.app",
  owner: {
    name: "Cintia Barletta",
    role: "Distribuidora oficial",
  },
  contact: {
    address: "Rivadavia 664",
    city: "Frías",
    province: "Santiago del Estero",
    country: "Argentina",
    postalCode: "G4233",
    phone: "+54 9 2494 00-7008",
    whatsapp: "5492494007008",
    email: "cintia-barletta@hotmail.com",
    hours: "Lun a Sáb · 09:00 – 13:00 y 17:00 – 21:00",
  },
  social: {
    instagram: "https://instagram.com/millanel.frias",
    facebook: "https://facebook.com/millanel.frias",
  },
  maps: {
    embedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1262.1350879829274!2d-65.12902487017423!3d-28.631172025609068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9425a84c5402ae17%3A0xde588dc2a9b1efcc!2sRivadavia%20664%2C%20G4233%20Fr%C3%ADas%2C%20Santiago%20del%20Estero!5e1!3m2!1ses-419!2sar!4v1779237810381!5m2!1ses-419!2sar",
    link: "https://maps.app.goo.gl/?q=Rivadavia+664+Frias+Santiago+del+Estero",
  },
} as const;

export const NAV_PRIMARY = [
  { label: "Catálogo", href: "/productos" },
  { label: "Perfumes", href: "/categorias/perfumes" },
  { label: "Cuidado", href: "/categorias/cuidado-personal" },
  { label: "Boxes", href: "/categorias/boxes" },
  { label: "Outlet", href: "/categorias/outlet" },
] as const;

export const PROVINCES_AR = [
  { code: "AR-C", name: "Ciudad Autónoma de Buenos Aires" },
  { code: "AR-B", name: "Buenos Aires" },
  { code: "AR-K", name: "Catamarca" },
  { code: "AR-H", name: "Chaco" },
  { code: "AR-U", name: "Chubut" },
  { code: "AR-X", name: "Córdoba" },
  { code: "AR-W", name: "Corrientes" },
  { code: "AR-E", name: "Entre Ríos" },
  { code: "AR-P", name: "Formosa" },
  { code: "AR-Y", name: "Jujuy" },
  { code: "AR-L", name: "La Pampa" },
  { code: "AR-F", name: "La Rioja" },
  { code: "AR-M", name: "Mendoza" },
  { code: "AR-N", name: "Misiones" },
  { code: "AR-Q", name: "Neuquén" },
  { code: "AR-R", name: "Río Negro" },
  { code: "AR-A", name: "Salta" },
  { code: "AR-J", name: "San Juan" },
  { code: "AR-D", name: "San Luis" },
  { code: "AR-Z", name: "Santa Cruz" },
  { code: "AR-S", name: "Santa Fe" },
  { code: "AR-G", name: "Santiago del Estero" },
  { code: "AR-V", name: "Tierra del Fuego" },
  { code: "AR-T", name: "Tucumán" },
] as const;
