import { z } from "zod";

const CartItemSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  code: z.string().nullable(),
  name: z.string(),
  price: z.number().nonnegative(),
  salePrice: z.number().nullable().optional(),
  image: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
});

const AddressSchema = z.object({
  street: z.string().min(3),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(3),
  notes: z.string().optional().nullable(),
});

export const CheckoutInputSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Ingresá tu nombre completo"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(6, "Ingresá tu teléfono"),
    dni: z.string().optional().nullable(),
  }),
  shippingMethod: z.enum(["pickup", "shipping"]),
  shippingZoneId: z.string().uuid().nullable().optional(),
  shippingAddress: AddressSchema.optional().nullable(),
  paymentMethod: z.enum(["mercadopago", "whatsapp", "transfer", "pickup_cash"]),
  items: z.array(CartItemSchema).min(1, "Tu carrito está vacío"),
  notes: z.string().optional().nullable(),
});

export type CheckoutInput = z.infer<typeof CheckoutInputSchema>;
