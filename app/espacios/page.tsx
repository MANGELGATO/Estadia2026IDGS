'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar, MapPin, Building, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import styles from './Espacios.module.css';

const espaciosMock = [
  {
    id: 'auditorio',
    name: 'Auditorio Principal',
    description: 'Espacio ideal para conferencias, presentaciones y eventos corporativos con capacidad para 150 personas.',
    capacity: 150,
    features: ['Proyector 4K', 'Sistema de audio profesional', 'Iluminación escénica', 'Wi-Fi de alta velocidad'],
    color: '#E91E8C'
  },
  {
    id: 'aula-robotica',
    name: 'Aula de Robótica',
    description: 'Laboratorio equipado para prácticas de automatización, electrónica y programación de brazos robóticos.',
    capacity: 25,
    features: ['Estaciones de trabajo equipadas', 'Kits de electrónica', 'Brazos robóticos DOBOT', 'Pizarrones interactivos'],
    color: '#0ea5e9'
  },
  {
    id: 'workshop-vr',
    name: 'Workshop de VR',
    description: 'Sala inmersiva para desarrollo y prueba de experiencias de realidad virtual, aumentada y mixta.',
    capacity: 15,
    features: ['PC Gamers de alto rendimiento', 'Visores Meta Quest 3', 'Sensores de movimiento', 'Pantallas de monitoreo'],
    color: '#7c3aed'
  },
  {
    id: 'sala-juntas',
    name: 'Sala de Juntas Creativa',
    description: 'Un entorno diseñado para sesiones de lluvia de ideas y planeación estratégica.',
    capacity: 10,
    features: ['Pantalla de 75"', 'Pintarrón de cristal', 'Mobiliario ergonómico', 'Coffee break opcional'],
    color: '#F59E0B'
  }
];

export default function EspaciosPage() {
  const [selectedEspacio, setSelectedEspacio] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const closeReserve = () => {
    setSelectedEspacio(null);
    setSubmitted(false);
  };

  const activeEspacio = espaciosMock.find(e => e.id === selectedEspacio);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>Reserva de Espacios</h1>
          <p className={styles.heroDesc}>
            Contamos con instalaciones de vanguardia diseñadas para fomentar la innovación, el aprendizaje y la colaboración.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.grid}>
          {espaciosMock.map((espacio) => (
            <div key={espacio.id} className={styles.card}>
              <div className={styles.cardHeader} style={{ backgroundColor: espacio.color }}>
                <Building className={styles.cardIcon} />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{espacio.name}</h3>
                <p className={styles.cardDesc}>{espacio.description}</p>
                <div className={styles.cardInfo}>
                  <span className={styles.capacityBadge}>
                    <Users size={14} /> Hasta {espacio.capacity} personas
                  </span>
                </div>
                <ul className={styles.featuresList}>
                  {espacio.features.slice(0, 3).map((feat, i) => (
                    <li key={i}><CheckCircle2 size={12} className={styles.checkIcon} style={{ color: espacio.color }} /> {feat}</li>
                  ))}
                  {espacio.features.length > 3 && <li><CheckCircle2 size={12} className={styles.checkIcon} style={{ color: espacio.color }} /> y más...</li>}
                </ul>
                <button 
                  className={styles.reserveBtn} 
                  style={{ backgroundColor: espacio.color }}
                  onClick={() => setSelectedEspacio(espacio.id)}
                >
                  Solicitar Reserva
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeEspacio && (
        <div className={styles.modalOverlay} onClick={closeReserve}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeReserve}>&times;</button>
            
            {submitted ? (
              <div className={styles.successState}>
                <CheckCircle2 size={60} color={activeEspacio.color} className={styles.successIcon} />
                <h2>¡Solicitud Enviada!</h2>
                <p>Tu solicitud para reservar el <strong>{activeEspacio.name}</strong> ha sido recibida. El equipo de PLAi se comunicará contigo a la brevedad para confirmar la disponibilidad.</p>
                <button className={styles.successBtn} onClick={closeReserve} style={{ backgroundColor: activeEspacio.color }}>
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader} style={{ borderColor: activeEspacio.color }}>
                  <h2>Reservar: {activeEspacio.name}</h2>
                  <p>Completa el formulario para solicitar el uso de este espacio.</p>
                </div>
                
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label>Nombre del solicitante o institución</label>
                    <input type="text" className={styles.input} required placeholder="Ej. Universidad XYZ" />
                  </div>
                  
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label>Correo Electrónico</label>
                      <input type="email" className={styles.input} required placeholder="correo@ejemplo.com" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Teléfono</label>
                      <input type="tel" className={styles.input} required placeholder="123 456 7890" />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label><Calendar size={14}/> Fecha deseada</label>
                      <input type="date" className={styles.input} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label><Clock size={14}/> Hora de inicio</label>
                      <input type="time" className={styles.input} required />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Propósito del evento</label>
                    <textarea className={styles.textarea} rows={3} required placeholder="Describe brevemente el tipo de evento, asistentes y requerimientos especiales..."></textarea>
                  </div>
                  
                  <div className={styles.checkboxGroup}>
                    <input type="checkbox" className={styles.checkbox} required id="aviso" />
                    <label htmlFor="aviso" className={styles.checkboxLabel}>
                      <ShieldCheck size={14} /> Acepto el <a href="#" style={{ color: activeEspacio.color, marginLeft: '0.2rem' }}>Aviso de Privacidad</a>
                    </label>
                  </div>

                  <button type="submit" className={styles.submitBtn} style={{ backgroundColor: activeEspacio.color }}>
                    Enviar Solicitud
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
