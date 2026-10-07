import styles from './prestamos.module.css';

export default function PrestamosPage() {
  const prestamos = [
    {
      id: "REQ-001",
      equipo: "Laptop HP ZBook",
      categoria: "Cómputo",
      fecha: "15 Oct 2026",
      estado: "Aprobado",
      icon: "💻"
    },
    {
      id: "REQ-002",
      equipo: "Visor Meta Quest 3",
      categoria: "Realidad Virtual",
      fecha: "18 Oct 2026",
      estado: "En revisión",
      icon: "🥽"
    },
    {
      id: "REQ-003",
      equipo: "Kit Arduino Mega",
      categoria: "Robótica",
      fecha: "02 Sep 2026",
      estado: "Devuelto",
      icon: "🤖"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Mis Préstamos</h1>
          <p>Historial y estado de tus solicitudes de equipo.</p>
        </div>
        <button className={styles.primaryBtn}>+ Nueva Solicitud</button>
      </div>
      
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Equipo / Dispositivo</th>
              <th>Fecha de Solicitud</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.map((prestamo) => (
              <tr key={prestamo.id}>
                <td>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemIcon}>{prestamo.icon}</div>
                    <div className={styles.itemDetails}>
                      <h4>{prestamo.equipo}</h4>
                      <p>{prestamo.categoria} • {prestamo.id}</p>
                    </div>
                  </div>
                </td>
                <td>{prestamo.fecha}</td>
                <td>
                  <span className={`${styles.badge} ${
                    prestamo.estado === 'Aprobado' ? styles.badgeApproved : 
                    prestamo.estado === 'En revisión' ? styles.badgePending : 
                    styles.badgeRejected
                  }`}>
                    {prestamo.estado}
                  </span>
                </td>
                <td>
                  <button className={styles.actionBtn}>Ver Detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
