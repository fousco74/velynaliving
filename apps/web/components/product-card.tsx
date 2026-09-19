import Image from "next/image";
import Link from "next/link";
import { formatXOF } from "@velyna/shared";
import type { ProductCard as ProductCardData } from "@/lib/api";
import { imageSrc } from "@/lib/api";

export const ProductCard = ({ product }: { product: ProductCardData }) => {
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/produit/${product.slug}`} className="product-card">
      <Image
        src={imageSrc(product.img)}
        alt={product.name}
        width={800}
        height={400}
        sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="product-image"
      />
      <div className="product-card-row">
        <span className="product-card-name">{product.name}</span>
        <span className="product-card-price">{formatXOF(product.price)}</span>
      </div>
      <div className="product-card-meta">
        <span>
          {product.house.name} — {product.capacity}
        </span>
        <span style={{ color: soldOut ? "var(--error)" : "var(--ink)" }}>
          {soldOut ? "Épuisé" : "En stock"}
        </span>
      </div>
    </Link>
  );
};
