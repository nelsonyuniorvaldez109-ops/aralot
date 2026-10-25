import Link from "next/link";
import styles from "../policies.module.css";

export const metadata = { title: "POLÍTICA DE COOKIES | ARA LOT" };

export default function CookiesPage() {
  return (
    <article className={styles.policy} aria-labelledby="policy-title">
      <h1 id="policy-title">POLÍTICA DE COOKIES</h1>
      <p><strong>ARA LOT — Tienda Online</strong></p>
      <p><strong>Última actualización:</strong> <time dateTime="2026-10-25">25 de octubre de 2026</time></p>

      <section aria-labelledby="section-1">
        <h2 id="section-1">1. Introducción</h2>
        <p>En ARA LOT nos comprometemos a ofrecer una experiencia de navegación segura, transparente y funcional.</p>
        <p>Esta Política de Cookies explica qué son las cookies y otras tecnologías de almacenamiento local, para qué pueden utilizarse en nuestro sitio web y cómo los usuarios pueden administrar sus preferencias.</p>
        <p>Esta política se aplica al sitio web <a href="https://aralot.vercel.app">https://aralot.vercel.app</a>.</p>
      </section>

      <section aria-labelledby="section-2">
        <h2 id="section-2">2. ¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de información que un sitio web puede almacenar en el navegador del usuario cuando visita una página.</p>
        <p>Se utilizan para recordar determinados datos, mantener sesiones y permitir que algunas funcionalidades del sitio trabajen correctamente.</p>
        <p>También existen tecnologías similares, como el almacenamiento local del navegador, que pueden conservar preferencias o información relacionada con la experiencia de compra.</p>
      </section>

      <section aria-labelledby="section-3">
        <h2 id="section-3">3. ¿Para qué utilizamos las cookies?</h2>
        <p>En ARA LOT, las cookies y tecnologías similares pueden utilizarse para:</p>
        <ul>
          <li><strong>Funcionamiento del sitio:</strong> mantener operativas las funciones esenciales de la tienda.</li>
          <li><strong>Seguridad:</strong> proteger las sesiones administrativas y facilitar la autenticación.</li>
          <li><strong>Preferencias de navegación:</strong> conservar determinadas selecciones o configuraciones cuando la funcionalidad esté habilitada.</li>
          <li><strong>Experiencia de compra:</strong> permitir funciones como recordar productos en el carrito o favoritos, según el mecanismo de almacenamiento implementado.</li>
        </ul>
      </section>

      <section aria-labelledby="section-4">
        <h2 id="section-4">4. Tecnologías utilizadas actualmente</h2>
        <p><strong>Cookies estrictamente necesarias</strong></p>
        <p>Permiten el funcionamiento básico del sitio, la seguridad y la administración de sesiones. Cuando sean indispensables para prestar una función solicitada, podrán utilizarse sin activar cookies opcionales.</p>
        <p><strong>Cookie de checkout: <code>__Host-ara-checkout</code></strong></p>
        <p>Identifica y protege la sesión del navegador al utilizar el checkout y permite recuperar el pedido asociado. Contiene un identificador firmado, no el detalle del carrito ni los datos de contacto del cliente. En producción se transmite por HTTPS, no es accesible mediante JavaScript y utiliza SameSite Strict.</p>
        <p><strong>Autenticación administrativa: <code>sb-&lt;referencia-del-proyecto&gt;-auth-token</code></strong></p>
        <p>Supabase utiliza estas cookies para mantener y renovar la sesión del panel administrativo. Pueden dividirse en varias cookies con sufijos numéricos, como .0 y .1. No se necesita una sesión administrativa para consultar el catálogo o comprar.</p>
        <p><strong>Carrito: <code>ara-lot-cart</code></strong></p>
        <p>Se guarda en localStorage para conservar los artículos seleccionados, sus opciones y cantidades entre visitas. No es una cookie y no se envía automáticamente con cada solicitud al servidor.</p>
        <p><strong>Favoritos: <code>ara-lot-favorites</code></strong></p>
        <p>Se guarda en localStorage y conserva los identificadores de los productos marcados como favoritos.</p>
        <p>Estas tecnologías sirven a funciones de compra solicitadas por el usuario y a la seguridad y autenticación. No hemos identificado cookies opcionales de análisis o publicidad en la implementación revisada; por eso no mostramos un aviso para aceptar cookies opcionales inexistentes. Tampoco se ha identificado uso propio de sessionStorage.</p>
        <p>Si incorporamos herramientas opcionales de análisis o publicidad, actualizaremos esta política y habilitaremos los controles de consentimiento que correspondan antes de activarlas.</p>
      </section>

      <section aria-labelledby="section-5">
        <h2 id="section-5">5. Cookies de terceros</h2>
        <p>Algunas funcionalidades técnicas del sitio pueden depender de proveedores externos, entre ellos servicios de infraestructura, alojamiento y autenticación.</p>
        <p>Supabase proporciona la base de datos, el almacenamiento de imágenes y la autenticación administrativa. Vercel aloja la aplicación. Las cookies de autenticación descritas se gestionan en el dominio de la tienda mediante la integración con Supabase.</p>
        <p>Los enlaces a WhatsApp e Instagram llevan a servicios externos cuando decides abrirlos. No se han identificado widgets incrustados de esas redes ni integraciones de Google Analytics, Meta Pixel o Vercel Analytics en el código revisado.</p>
        <p>Los proveedores externos pueden aplicar sus propias políticas de privacidad y tecnologías de almacenamiento.</p>
      </section>

      <section aria-labelledby="section-6">
        <h2 id="section-6">6. Duración de las cookies</h2>
        <ul>
          <li><strong>Checkout:</strong> 7 días desde que se establece o renueva la cookie. Ese plazo no equivale a la duración de una reserva de inventario.</li>
          <li><strong>Autenticación administrativa:</strong> la biblioteca instalada configura una duración de almacenamiento de hasta 400 días, renovable. La validez real de la sesión depende de Supabase; conservar la cookie no garantiza que la sesión siga autorizada. El navegador puede limitar su duración.</li>
          <li><strong>Carrito y favoritos:</strong> no tienen un vencimiento automático configurado en localStorage. Permanecen hasta que se actualizan o vacían mediante la tienda, se eliminan los datos del sitio o el navegador los borra.</li>
        </ul>
      </section>

      <section aria-labelledby="section-7">
        <h2 id="section-7">7. ¿Cómo administrar las cookies?</h2>
        <p>Puedes consultar y eliminar las cookies y el almacenamiento local desde la configuración de privacidad de tu navegador, en los datos del sitio aralot.vercel.app. También puedes retirar productos del carrito o desmarcar favoritos desde la tienda, y cerrar la sesión administrativa cuando corresponda.</p>
        <p>Cuando ARA LOT habilite cookies opcionales sujetas a consentimiento, los visitantes podrán aceptar, rechazar o modificar esas preferencias mediante las opciones disponibles en el sitio.</p>
        <p>Deshabilitar determinadas tecnologías de almacenamiento puede afectar funciones como las sesiones, el carrito o la conservación de preferencias.</p>
      </section>

      <section aria-labelledby="section-8">
        <h2 id="section-8">8. Protección de los datos personales</h2>
        <p>ARA LOT procura tratar la información de sus usuarios de forma responsable, considerando las disposiciones aplicables de la República Dominicana, incluida la Ley núm. 172-13 sobre protección de datos de carácter personal.</p>
        <p>Para obtener información sobre el tratamiento de datos personales, puedes consultar la <Link href="/privacidad">Política de Privacidad de ARA LOT</Link>.</p>
      </section>

      <section aria-labelledby="section-9">
        <h2 id="section-9">9. Modificaciones de esta política</h2>
        <p>ARA LOT podrá actualizar esta Política de Cookies cuando cambien las tecnologías utilizadas, sus funcionalidades o las disposiciones legales aplicables.</p>
        <p>La versión actualizada estará disponible en nuestro sitio web y mostrará su fecha de modificación.</p>
      </section>

      <section aria-labelledby="section-10">
        <h2 id="section-10">10. Contacto</h2>
        <p>Para consultas relacionadas con esta política, puede comunicarse con nosotros a través de:</p>
        <p><strong>Correo electrónico:</strong> <a href="mailto:aralot.caribe@gmail.com">aralot.caribe@gmail.com</a></p>
        <p><strong>Instagram:</strong> <a href="https://www.instagram.com/aralot.caribe" target="_blank" rel="noopener noreferrer">@aralot.caribe</a></p>
        <p><strong>Sitio web:</strong> <a href="https://aralot.vercel.app">https://aralot.vercel.app</a></p>
      </section>
    </article>
  );
}
