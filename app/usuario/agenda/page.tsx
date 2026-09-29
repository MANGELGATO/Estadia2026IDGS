import styles from './agenda.module.css';

export default function AgendaPage() {
  const cursos = [
    {
      id: "CUR-101",
      titulo: "Fabricación Digital Básica",
      fecha: "15 de Noviembre, 2026",
      hora: "10:00 AM - 14:00 PM",
      lugar: "Laboratorio PLAi Central",
      asistentes: 25,
      estado: "Confirmado",
      icon: "🖨️"
    },
    {
      id: "CUR-102",
      titulo: "Introducción a la Robótica",
      fecha: "22 de Noviembre, 2026",
      hora: "09:00 AM - 13:00 PM",
      lugar: "Aula Maker",
      asistentes: 30,
      estado: "Confirmado",
      icon: "🤖"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Mi Agenda</h1>
          <p>Revisa los cursos que tienes agendados como institución.</p>
        </div>
        <button className={styles.primaryBtn}>+ Agendar Curso</button>
      </div>

      <div className={styles.timeline}>
        {cursos.map((curso, index) => (
          <div key={curso.id} className={styles.timelineItem}>
            <div className={styles.timelineIcon}>{curso.icon}</div>
            <div className={styles.timelineContent}>
              <div className={styles.timelineHeader}>
                <div>
                  <h3>{curso.titulo}</h3>
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>ID: {curso.id}</span>
                </div>
                <span className={styles.timelineDate}>{curso.fecha}</span>
              </div>
              
              <div className={styles.timelineBody}>
                <div className={styles.detailRow}>
                  <span>🕒</span> {curso.hora}
                </div>
                <div className={styles.detailRow}>
                  <span>📍</span> {curso.lugar}
                </div>
                <div className={styles.detailRow}>
                  <span>👥</span> {curso.asistentes} asistentes registrados
                </div>
              </div>

              <div className={styles.actionFooter}>
                <button className={styles.secondaryBtn}>Ver Detalles</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
