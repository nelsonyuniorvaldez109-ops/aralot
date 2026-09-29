"use client";

import { useState } from "react";
import { ImageUpload } from "../productos/ImageUpload";
import { createCategory, updateCategory } from "./actions";
import styles from "../productos/products.module.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

type Props = {
  category?: Category;
};

export function CategoryForm({ category }: Props) {
  const isEditing = Boolean(category);

  const [imageUrl, setImageUrl] = useState(
    category?.image_url ?? ""
  );

  const [uploading, setUploading] = useState(false);

  return (
    <form
      action={isEditing ? updateCategory : createCategory}
      className={styles.form}
    >
      {category && (
        <input
          type="hidden"
          name="id"
          value={category.id}
        />
      )}

      <input
        type="hidden"
        name="image_url"
        value={imageUrl}
      />

      <div className={styles.field}>
        <label htmlFor="name">
          Nombre *
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={category?.name ?? ""}
          required
          maxLength={100}
          placeholder="Ej. Accesorios"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">
          Descripción
        </label>

        <textarea
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
          maxLength={500}
          rows={4}
          placeholder="Opcional"
        />
      </div>

      <ImageUpload
        label={
          isEditing
            ? "Imagen de la categoría"
            : "Agregar imagen"
        }
        value={imageUrl}
        onChange={setImageUrl}
        onBusy={setUploading}
      />

      <div className={styles.field}>
        <label htmlFor="sort_order">
          Orden de aparición
        </label>

        <input
          id="sort_order"
          name="sort_order"
          type="number"
          min="0"
          step="1"
          defaultValue={category?.sort_order ?? 0}
          required
        />
      </div>

      <div className={styles.field}>
        <label>
          <input
            name="active"
            type="checkbox"
            value="true"
            defaultChecked={category?.active ?? true}
          />

          {" "}Categoría activa
        </label>
      </div>

      <button
        type="submit"
        className={styles.primary}
        disabled={uploading}
      >
        {uploading
          ? "Subiendo imagen..."
          : isEditing
            ? "Guardar cambios"
            : "Crear categoría"}
      </button>
    </form>
  );
}