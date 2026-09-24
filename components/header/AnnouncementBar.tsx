import styles from "./Header.module.css";

export function AnnouncementBar() {
  return (
    <div className={styles.announcement}>
      <div className={`container ${styles.announcementInner}`}>
        <p>ENVÍOS A TODA REPÚBLICA DOMINICANA</p>
        <span className={styles.whatsapp}>ATENCIÓN POR WHATSAPP</span>
      </div>
    </div>
  );
}