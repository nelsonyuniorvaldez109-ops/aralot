import { productAccess } from "../productos/access";
import styles from "../productos/products.module.css";
import { AddInventory } from "./AddInventory";
import { AdjustInventory } from "./AdjustInventory";

export const metadata = {
  title: "Inventario | Administración ARA LOT",
};

type InventoryRow = {
  id: string;
  quantity: number;
  updated_at: string;
  low_stock_threshold: number;
  product_variants: {
    id: string;
    color: string | null;
    size: string | null;
    presentation: string | null;
    active: boolean;
    products: {
      id: string;
      name: string;
      active: boolean;
    } | null;
  } | null;
};

export default async function InventoryPage() {
  const { supabase, allowed } = await productAccess();

  if (!allowed) {
    return (
      <main id="admin-content" className={styles.page}>
        <h1>Inventario</h1>

        <p role="alert">
          Tu cuenta no tiene permisos para gestionar el inventario.
        </p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("inventory")
    .select(`
      id,
      quantity,
      updated_at,
      low_stock_threshold,
      product_variants (
        id,
        color,
        size,
        presentation,
        active,
        products (
          id,
          name,
          active
        )
      )
    `)
    .order("quantity", { ascending: true })
    .returns<InventoryRow[]>();

  return (
    <main id="admin-content" className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>Inventario</h1>

          <p>
            Consulta y administra las existencias por producto, color y talla.
          </p>
        </div>
      </header>

      {error ? (
        <p className={styles.notice} role="alert">
          No pudimos cargar el inventario.
        </p>
      ) : (
        <div
          className={styles.tableWrap}
          tabIndex={0}
          role="region"
          aria-label="Inventario de productos"
        >
          <table className={styles.table}>
            <caption className={styles.caption}>
              {data?.length ?? 0} variantes en inventario
            </caption>

            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Color</th>
                <th scope="col">Talla</th>
                <th scope="col">Existencias</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {data?.map((item) => {
                const quantity = item.quantity ?? 0;
                const threshold = item.low_stock_threshold ?? 5;

                let status = "Disponible";

                if (quantity <= 0) {
                  status = "Agotado";
                } else if (quantity <= threshold) {
                  status = "Stock bajo";
                }

                return (
                  <tr key={item.id}>
                    <th scope="row">
                      {item.product_variants?.products?.name ??
                        "Producto no disponible"}
                    </th>

                    <td>
                      {item.product_variants?.color || "—"}
                    </td>

                    <td>
                      {item.product_variants?.size ||
                        item.product_variants?.presentation ||
                        "—"}
                    </td>

                    <td>
                      <strong>{quantity}</strong>
                    </td>

                    <td>
                      <span className={styles.badge}>
                        {status}
                      </span>
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <AddInventory
                          inventoryId={item.id}
                        />

                        <AdjustInventory
                          inventoryId={item.id}
                          key={item.updated_at}
                          expectedUpdatedAt={item.updated_at}
                          currentQuantity={quantity}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!data?.length && (
            <p className={styles.empty}>
              Todavía no hay existencias registradas.
            </p>
          )}
        </div>
      )}
    </main>
  );
}