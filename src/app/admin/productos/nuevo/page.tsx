import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/queries/categories";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return <ProductForm categories={categories} />;
}
