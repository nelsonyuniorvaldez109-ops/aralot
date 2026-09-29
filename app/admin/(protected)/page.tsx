import styles from "../admin.module.css";

export const metadata = {
  title: "Administración | ARA LOT",
  robots: { index: false, follow: false },
};

const metrics = ["Total de productos", "Productos activos", "Productos con poco stock", "Promociones activas"];

export default function AdminPage() {
  return (
        <main id="admin-content" className={styles.content} tabIndex={-1}>
          <div className={styles.heading}>
            <p>RESUMEN GENERAL</p>
            <h1>Dashboard</h1>
            <p>Una vista general de tu catálogo, inventario y promociones.</p>
          </div>
          <dl className={styles.metrics}>
            {metrics.map(label => (
              <div className={styles.card} key={label}>
                <dt>{label}</dt>
                <dd aria-label="Dato no disponible">—</dd>
                <p>Pendiente de conexión</p>
              </div>
            ))}
          </dl>
          <section className={styles.stock} aria-labelledby="low-stock-title">
            <div className={styles.stockHeading}>
              <h2 id="low-stock-title">Productos con poco stock</h2>
              <span>Inventario</span>
            </div>
            <div className={styles.empty}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                <path d="m3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10M7.5 4.5l9 5v5"/>
              </svg>
              <h3>Información de stock aún no disponible</h3>
              <p>Los productos con pocas unidades aparecerán aquí cuando se conecte el inventario.</p>
            </div>
          </section>
          <p className={styles.note}>Los pedidos se reciben y coordinan por WhatsApp. Este panel está destinado a la gestión del catálogo.</p>
        </main>
  );
}
