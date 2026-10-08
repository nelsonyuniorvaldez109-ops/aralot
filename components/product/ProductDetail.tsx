"use client";
import { selectedVariant } from "@/lib/products/catalog";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { getProductImage, type Product } from "@/data/products";
import styles from "./ProductDetail.module.css";
import { ComingSoonRibbon } from "./ComingSoonRibbon";

type ProductDetailProps = {
  product: Product;
  hasImage: boolean;
  placeholderVariant: number;
};

const priceFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function ProductDetail({
  product,
  hasImage,
  placeholderVariant,
}: ProductDetailProps) {
  const { addItem, ready: cartReady } = useCart();
  const {
    isFavorite,
    ready: favoritesReady,
    toggleFavorite,
  } = useFavorites();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedPresentation, setSelectedPresentation] = useState<string | undefined>(product.presentation);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");
  const favorite = isFavorite(product.id);
  const comingSoon = product.publicationStatus === "coming_soon";
  const variant = selectedVariant(product, selectedColor, selectedSize, selectedPresentation);
  const stock = variant?.stock ?? 0;
  const anyStock = product.variants?.some(v => v.stock > 0) ?? false;
  const selectedImage = variant?.image || getProductImage(product, selectedColor);
  const imageAvailable = Boolean(selectedImage) && (hasImage || Boolean(variant?.image || (selectedColor && product.imagesByColor?.[selectedColor])));

  const price = priceFormatter.format(product.price);
  const compareAtPrice = product.compareAtPrice
    ? priceFormatter.format(product.compareAtPrice)
    : undefined;

  function handleAddToCart() {
    if (comingSoon) { setFeedback("Disponible próximamente"); return; }
    const missingSelections: string[] = [];

    if (product.colors && !selectedColor) missingSelections.push("un color");
    if (product.sizes && !selectedSize) missingSelections.push("una talla");

    if (product.presentations?.length && !selectedPresentation) missingSelections.push("una presentaci\u00f3n");

    if (missingSelections.length > 0) {
      setFeedback(`Selecciona ${missingSelections.join(" y ")} antes de continuar.`);
      return;
    }

    if (!variant || stock < 1 || quantity > stock) {
      setFeedback("Esta combinaci\u00f3n no tiene unidades suficientes disponibles.");
      return;
    }
    const added = addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: selectedImage,
      imageAvailable,
      price: product.price,
      quantity,
      selectedColor,
      selectedSize,
      presentation: selectedPresentation,
    });
    setFeedback(added ? "Producto agregado al carrito" : "No se pueden agregar m\u00e1s unidades de este producto.");
  }

  return (
    <article className={styles.product}>
      <div className={styles.gallery}>
        {imageAvailable ? (
          <Image
            src={selectedImage}
            alt={`${product.name}, producto de ARA LOT`}
            fill
            priority
            sizes="(max-width: 899px) 100vw, 58vw"
            className={styles.image}
          />
        ) : (
          <div
            className={`${styles.placeholder} ${styles[`placeholder${placeholderVariant}`]}`}
            aria-hidden="true"
          />
        )}

        {comingSoon && <ComingSoonRibbon />}
        {product.badge ? <span className={styles.badge}>{product.badge}</span> : null}
      </div>

      <div className={styles.information}>
        <p className={styles.category}>{product.category}</p>
        <h1>{product.name}</h1>

        <p
          className={styles.prices}
          aria-label={
            compareAtPrice
              ? `Precio de oferta ${price}; precio anterior ${compareAtPrice}`
              : `Precio ${price}`
          }
        >
          <span aria-hidden="true">{price}</span>
          {compareAtPrice ? <del aria-hidden="true">{compareAtPrice}</del> : null}
        </p>

        <p className={styles.description}>{product.description}</p>

        {product.colors ? (
          <fieldset className={styles.optionGroup}>
            <legend>
              Color
              {selectedColor ? <span>: {selectedColor}</span> : null}
            </legend>
            <div className={styles.options}>
              {product.colors.map((color) => (
                <button
                  className={styles.option}
                  type="button"
                  key={color}
                  disabled={!comingSoon && !product.variants?.some(v => v.color === color && v.stock > 0)}
                  aria-pressed={selectedColor === color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(undefined);
                    setQuantity(1);
                    setFeedback("");
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {product.sizes ? (
          <fieldset className={styles.optionGroup}>
            <legend>
              Talla
              {selectedSize ? <span>: {selectedSize}</span> : null}
            </legend>
            <div className={styles.options}>
              {product.sizes.map((size) => (
                <button
                  className={`${styles.option} ${styles.sizeOption}`}
                  type="button"
                  key={size}
                  disabled={!comingSoon && !product.variants?.some(v => v.size === size && (!selectedColor || v.color === selectedColor) && v.stock > 0)}
                  aria-pressed={selectedSize === size}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                    setFeedback("");
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {product.presentations && product.presentations.length > 1 ? (
          <fieldset className={styles.optionGroup}>
            <legend>Presentación</legend>
            <div className={styles.options}>{product.presentations.map(presentation => (
              <button key={presentation} type="button" className={styles.option}
                aria-pressed={selectedPresentation === presentation}
                disabled={!comingSoon && !product.variants?.some(v => v.presentation === presentation && v.stock > 0)}
                onClick={() => { setSelectedPresentation(presentation); setQuantity(1); setFeedback(""); }}>
                {presentation}
              </button>
            ))}</div>
          </fieldset>
        ) : null}

        {product.presentation ? (
          <p className={styles.presentation}>
            <span>Presentación</span>
            {product.presentation}
          </p>
        ) : null}

        <div className={styles.purchaseControls}>
          <div className={styles.quantity} aria-label="Selector de cantidad">
            <button
              type="button"
              aria-label="Reducir cantidad"
              disabled={quantity === 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              −
            </button>
            <output aria-live="polite" aria-label={`Cantidad: ${quantity}`}>
              {quantity}
            </output>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              disabled={quantity >= Math.min(20, stock) || !variant}
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>

          <button
            className={styles.addButton}
            type="button"
            disabled={comingSoon || !cartReady || !anyStock}
            onClick={handleAddToCart}
          >
            Agregar al carrito
          </button>

          <button
            className={styles.favoriteButton}
            type="button"
            aria-label={
              favorite
                ? `Quitar ${product.name} de favoritos`
                : `Agregar ${product.name} a favoritos`
            }
            disabled={!favoritesReady}
            aria-pressed={favorite}
            onClick={() => toggleFavorite(product.id)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" />
            </svg>
          </button>
        </div>

        <p className={styles.feedback} role="status" aria-live="polite">
          {feedback || (comingSoon ? "Disponible próximamente" : !anyStock ? "Producto agotado" : variant && stock === 0 ? "Combinaci\u00f3n agotada" : "")}
        </p>
      </div>
    </article>
  );
}
