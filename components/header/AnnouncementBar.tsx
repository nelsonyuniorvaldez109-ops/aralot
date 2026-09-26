import styles from "./AnnouncementBar.module.css";

const messages = [
  ["ENVÍOS LOS FINES DE SEMANA", "A TODA REPÚBLICA DOMINICANA"],
  ["ATENCIÓN POR WHATSAPP", "¡HAZ TU PEDIDO AHORA!"],
  ["ENVÍOS A TODA", "REPÚBLICA DOMINICANA"],
] as const;

function AnnouncementIcon({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {index === 0 ? (
        <><path d="M3 6h11v11H3zM14 10h4l3 4v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>
      ) : index === 1 ? (
        <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.1-4.7a8.5 8.5 0 1 1 16.4-3.8Z" /><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 1.5c-.5 2-2 2-3.5 1.5-4-1.5-6.5-4-7-7C6.3 8 7 7 8 7Z" /></>
      ) : (
        <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>
      )}
    </svg>
  );
}

export function AnnouncementBar() {
  return (
    <section className={styles.announcement} aria-label="Información de ARA LOT">
      <input className={styles.pause} id="announcement-pause" type="checkbox" aria-label="Pausar marquesina" />
      <label className={styles.pauseLabel} htmlFor="announcement-pause" title="Pausar o reanudar marquesina">
        <span className={styles.pauseSymbol} aria-hidden="true">Ⅱ</span>
        <span className={styles.playSymbol} aria-hidden="true">▶</span>
      </label>
      <div className={styles.viewport}>
        <div className={styles.track}>
          {[0, 1].map((copy) => (
            <div className={styles.group} key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {messages.map(([first, second], index) => (
                <div className={styles.message} key={first}>
                  <AnnouncementIcon index={index} />
                  <p><span>{first}</span><span>{second}</span></p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}