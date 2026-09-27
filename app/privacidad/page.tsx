import styles from "../policies.module.css";

export const metadata = { title: "POLÍTICA DE PRIVACIDAD | ARA LOT" };

export default function PrivacyPage() {
  return (
    <article className={styles.policy} aria-labelledby="policy-title">
      <h1 id="policy-title">POLÍTICA DE PRIVACIDAD</h1>
      <section aria-labelledby="section-1">
        <h2 id="section-1">1. INFORMACIÓN QUE PROPORCIONA EL CLIENTE</h2>
        <p>ARA LOT puede recibir los datos que el cliente proporciona voluntariamente al realizar o coordinar un pedido, tales como:</p>
        <ul>
          <li>nombre</li>
          <li>número de teléfono</li>
          <li>información necesaria para la entrega</li>
          <li>detalles relacionados con el pedido</li>
        </ul>
        <p>Solo solicitar información razonablemente necesaria para atender la solicitud o gestionar el pedido.</p>
      </section>

      <section aria-labelledby="section-2">
        <h2 id="section-2">2. FINALIDAD DE LA INFORMACIÓN</h2>
        <p>La información proporcionada podrá utilizarse para:</p>
        <ul>
          <li>procesar y coordinar pedidos</li>
          <li>gestionar entregas o recogidas</li>
          <li>comunicarse con el cliente sobre su pedido</li>
          <li>atender consultas, reclamaciones o solicitudes</li>
          <li>brindar atención al cliente</li>
        </ul>
      </section>

      <section aria-labelledby="section-3">
        <h2 id="section-3">3. WHATSAPP</h2>
        <p>Cuando el cliente decide continuar un pedido mediante WhatsApp, la comunicación pasa a realizarse también a través de dicho servicio.</p>
        <p>El tratamiento de información realizado directamente por WhatsApp está sujeto a las condiciones y políticas aplicables de ese servicio.</p>
      </section>

      <section aria-labelledby="section-4">
        <h2 id="section-4">4. CONSERVACIÓN Y SEGURIDAD</h2>
        <p>ARA LOT procurará manejar la información de sus clientes de forma responsable y adoptar medidas razonables para evitar accesos, usos o divulgaciones no autorizadas.</p>
      </section>

      <section aria-labelledby="section-5">
        <h2 id="section-5">5. DIVULGACIÓN DE INFORMACIÓN</h2>
        <p>ARA LOT no deberá divulgar información personal a terceros salvo cuando sea razonablemente necesario para gestionar el servicio solicitado, exista autorización del cliente o sea requerido conforme a las obligaciones legales aplicables.</p>
      </section>

      <section aria-labelledby="section-6">
        <h2 id="section-6">6. DERECHOS Y SOLICITUDES</h2>
        <p>El cliente podrá comunicarse mediante los canales oficiales de ARA LOT para realizar consultas o solicitudes relacionadas con la información que haya proporcionado.</p>
        <p>Las solicitudes serán atendidas conforme a las circunstancias y la legislación aplicable.</p>
      </section>

      <section aria-labelledby="section-7">
        <h2 id="section-7">7. CAMBIOS EN ESTA POLÍTICA</h2>
        <p>Esta política podrá actualizarse cuando cambien las funcionalidades del sitio, los procesos de ARA LOT o los requisitos aplicables.</p>
        <p>La versión vigente estará disponible en esta página.</p>
      </section>

      <section aria-labelledby="section-8">
        <h2 id="section-8">8. CONTACTO</h2>
        <p>Para consultas relacionadas con privacidad, utilizar los canales oficiales de contacto publicados en la tienda.</p>
      </section>
    </article>
  );
}
