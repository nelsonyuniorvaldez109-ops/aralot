import styles from "../policies.module.css";

export const metadata = { title: "Reclamaciones y devoluciones | ARA LOT" };

export default function ReturnsPage() {
  return (
    <article className={styles.policy} aria-labelledby="policy-title">
      <h1 id="policy-title">RECLAMACIONES Y DEVOLUCIONES</h1>
      <p>El cliente dispone de un período máximo de 3 días a partir de la recepción del pedido para presentar una reclamación y solicitar una devolución.</p>
      <p>La solicitud deberá comunicarse dentro de dicho período. Una vez recibida, se revisará el caso para determinar si cumple con las condiciones establecidas para la devolución.</p>
      <p>Cuando sea necesario, podremos solicitar fotografías, videos u otra información para verificar el estado del producto.</p>

      <section aria-labelledby="cancellation-title">
        <h2 id="cancellation-title">CANCELACIÓN DE PEDIDOS</h2>
        <p>El cliente dispone de un período máximo de 5 horas desde la realización del pedido para solicitar su cancelación.</p>
        <p>Después de transcurridas las 5 horas, la solicitud de cancelación podrá no ser aceptada debido a que el pedido puede haber comenzado su proceso de preparación o procesamiento.</p>
      </section>

      <section aria-labelledby="conditions-title">
        <h2 id="conditions-title">CONDICIONES GENERALES</h2>
        <p>Las solicitudes de devolución, reclamación o cancelación deberán realizarse mediante los canales oficiales de atención de la tienda.</p>
        <p>Las condiciones anteriores no limitan los derechos que puedan corresponder al consumidor conforme a la legislación aplicable.</p>
      </section>
    </article>
  );
}
