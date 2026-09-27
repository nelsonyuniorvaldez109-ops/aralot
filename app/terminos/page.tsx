import styles from "../policies.module.css";

export const metadata = { title: "TÉRMINOS Y CONDICIONES | ARA LOT" };

export default function TermsPage() {
  return (
    <article className={styles.policy} aria-labelledby="policy-title">
      <h1 id="policy-title">TÉRMINOS Y CONDICIONES</h1>
      <section aria-labelledby="section-1">
        <h2 id="section-1">1. INFORMACIÓN GENERAL</h2>
        <p>El uso de este sitio web y la realización de pedidos a través de ARA LOT implican la aceptación de los presentes términos y condiciones.</p>
        <p>ARA LOT se reserva el derecho de actualizar la información disponible en el sitio cuando sea necesario, procurando mantener actualizados los productos, precios y condiciones mostradas.</p>
      </section>

      <section aria-labelledby="section-2">
        <h2 id="section-2">2. PRODUCTOS</h2>
        <p>Las imágenes de los productos tienen fines ilustrativos y buscan representar de la manera más fiel posible los artículos ofrecidos.</p>
        <p>La disponibilidad de productos, colores, tallas y presentaciones puede variar.</p>
        <p>La recepción de una solicitud de pedido no garantiza por sí sola la disponibilidad definitiva del producto. La disponibilidad podrá ser confirmada durante el proceso de coordinación del pedido.</p>
      </section>

      <section aria-labelledby="section-3">
        <h2 id="section-3">3. PRECIOS</h2>
        <p>Los precios mostrados en la tienda se expresan en pesos dominicanos (RD$), salvo que se indique expresamente lo contrario.</p>
        <p>ARA LOT procurará mantener actualizados los precios publicados.</p>
        <p>En caso de detectarse un error evidente en el precio o información de un producto, se informará al cliente antes de confirmar el pedido.</p>
      </section>

      <section aria-labelledby="section-4">
        <h2 id="section-4">4. PEDIDOS</h2>
        <p>El cliente es responsable de proporcionar información correcta y suficiente para procesar y coordinar su pedido.</p>
        <p>El envío de un pedido a través del sitio constituye una solicitud de compra.</p>
        <p>Cuando corresponda, los detalles necesarios para completar la coordinación serán comunicados mediante los canales oficiales de atención de ARA LOT.</p>
      </section>

      <section aria-labelledby="section-5">
        <h2 id="section-5">5. ENTREGAS</h2>
        <p>Las entregas se realizan exclusivamente los sábados y domingos, conforme a la política de entregas de ARA LOT.</p>
        <p>El cliente debe proporcionar correctamente los datos necesarios para coordinar la entrega.</p>
        <p>Cuando se seleccione la modalidad de recogida, el lugar y horario serán coordinados directamente entre ARA LOT y el cliente.</p>
      </section>

      <section aria-labelledby="section-6">
        <h2 id="section-6">6. RECLAMACIONES, DEVOLUCIONES Y CANCELACIONES</h2>
        <p>Las reclamaciones, devoluciones y cancelaciones se regirán por la Política de Entrega, Reclamaciones, Devoluciones y Cancelaciones publicada en este sitio.</p>
      </section>

      <section aria-labelledby="section-7">
        <h2 id="section-7">7. USO DEL SITIO</h2>
        <p>El usuario se compromete a utilizar el sitio de forma lícita y a proporcionar información veraz al realizar un pedido.</p>
        <p>No deberá utilizar el sitio para realizar actividades fraudulentas, interferir con su funcionamiento o intentar acceder sin autorización a sistemas, información o funcionalidades restringidas.</p>
      </section>

      <section aria-labelledby="section-8">
        <h2 id="section-8">8. PROPIEDAD INTELECTUAL</h2>
        <p>Los elementos propios de ARA LOT presentes en el sitio, incluyendo su identidad visual, textos originales, diseños y demás contenido protegido, no deberán utilizarse, reproducirse o distribuirse sin autorización cuando la legislación aplicable así lo requiera.</p>
      </section>

      <section aria-labelledby="section-9">
        <h2 id="section-9">9. ACTUALIZACIONES</h2>
        <p>ARA LOT podrá actualizar estos términos cuando sea necesario para reflejar cambios en sus servicios, procesos o requisitos aplicables.</p>
        <p>La versión publicada en el sitio será la versión disponible para consulta del usuario.</p>
      </section>

      <section aria-labelledby="section-10">
        <h2 id="section-10">10. CONTACTO</h2>
        <p>Para consultas relacionadas con pedidos, entregas, reclamaciones o estos términos, el cliente puede utilizar los canales oficiales de atención publicados en la tienda.</p>
      </section>
    </article>
  );
}
