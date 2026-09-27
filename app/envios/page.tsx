import styles from "../policies.module.css";

export const metadata = { title: "Política de entregas | ARA LOT" };

export default function DeliveriesPage() {
  return (
    <article className={styles.policy} aria-labelledby="policy-title">
      <h1 id="policy-title">POLÍTICA DE ENTREGAS</h1>
      <p>Las entregas de pedidos se realizan exclusivamente los sábados y domingos.</p>
      <p>El cliente debe asegurarse de proporcionar correctamente la información necesaria para realizar la entrega.</p>
    </article>
  );
}
