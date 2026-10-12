"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { RiVideoLine, RiSave3Line } from 'react-icons/ri';

const categories = [
  { id: 'realidad-virtual', name: 'Realidad Virtual' },
  { id: 'robotica', name: 'Robótica' },
  { id: 'fabricacion-digital', name: 'Fabricación Digital' },
  { id: 'drones', name: 'Drones' },
  { id: 'computo-multimedia', name: 'Cómputo / Multimedia' }
];

const readSavedVideo = (categoryId: string): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`category_video_${categoryId}`) || '';
};

export default function CategoriasConfigPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [videoUrl, setVideoUrl] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  // Carga inicial desde localStorage (solo cliente, diferida para evitar setState síncrono en el efecto)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVideoUrl(readSavedVideo(categories[0].id));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setVideoUrl(readSavedVideo(categoryId));
    setSavedMessage(false);
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`category_video_${selectedCategory}`, videoUrl);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Configuración de Categorías</h1>
          <p className={styles.subtitle}>Gestiona el contenido multimedia de las categorías de PLAi</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Selecciona una Categoría</label>
            <select 
              className={styles.select}
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <RiVideoLine className={styles.icon} /> URL del Video (YouTube)
            </label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Ej: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className={styles.helpText}>Ingresa el enlace del video de YouTube que quieres mostrar en la sección &quot;Casos de Éxito Destacados&quot;.</p>
          </div>

          <button className={styles.saveBtn} onClick={handleSave}>
            <RiSave3Line /> Guardar Cambios
          </button>
          
          {savedMessage && <p className={styles.successMessage}>¡Configuración guardada exitosamente!</p>}

          <div className={styles.previewContainer}>
            <h3 className={styles.previewTitle}>Vista Previa</h3>
            {videoUrl ? (
              <div className={styles.videoWrapper}>
                <iframe
                  width="100%"
                  height="315"
                  src={videoUrl.includes('watch?v=') ? videoUrl.replace("watch?v=", "embed/") : videoUrl}
                  title="Vista previa del video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: 'var(--radius-lg)' }}
                ></iframe>
              </div>
            ) : (
              <div className={styles.emptyPreview}>
                <p>Ingresa una URL de YouTube para ver la vista previa.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
