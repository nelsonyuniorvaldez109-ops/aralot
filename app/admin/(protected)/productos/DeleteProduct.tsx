"use client";

import { useActionState, useRef } from "react";
import { deleteProduct } from "./actions";
import type { ListProduct, SaveState } from "./model";
import styles from "./products.module.css";

export function DeleteProduct({ product }: { product: ListProduct }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<SaveState, FormData>(deleteProduct, { error: "" });
  return <>
    <button type="button" className={styles.textButton} onClick={() => dialog.current?.showModal()} aria-label={`Eliminar ${product.name}`}>Eliminar</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={`delete-${product.id}`} onCancel={event => { if (pending) event.preventDefault(); }}>
      <h2 id={`delete-${product.id}`}>Eliminar producto</h2>
      <p>Se eliminará «{product.name}» junto con sus variantes e inventario. Esta acción no se puede deshacer.</p>
      <form action={action}>
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="updated_at" value={product.updated_at} />
        <label htmlFor={`confirm-${product.id}`}>Escribe ELIMINAR para confirmar</label>
        <input id={`confirm-${product.id}`} name="confirmation" required pattern="ELIMINAR" autoComplete="off" disabled={pending} />
        {state.error && <p role="alert" className={styles.notice}>{state.error}</p>}
        <div className={styles.actions}>
          <button type="button" disabled={pending} onClick={() => dialog.current?.close()}>Cancelar</button>
          <button className={styles.primary} type="submit" disabled={pending}>{pending ? "Eliminando…" : "Eliminar definitivamente"}</button>
        </div>
      </form>
    </dialog>
  </>;
}
