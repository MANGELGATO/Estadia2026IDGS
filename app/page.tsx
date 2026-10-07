'use client';
import SubHeader from './components/SubHeader';
import HeroSection from './components/HeroSection';
import CategoryCarousel from './components/CategoryCarousel';
import EquipmentFilterGrid from './components/EquipmentFilterGrid';
import AppCarousel from './components/AppCarousel';
import CourseCallout from './components/CourseCallout';
import AccessibilityButton from './components/AccessibilityButton';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <SubHeader />
      <HeroSection />

      {/* Carrusel de navegación a categorías */}
      <div id="categorias">
        <CategoryCarousel />
      </div>

      {/* Grid de dispositivos (solo vista de catálogo) */}
      <div id="equipos">
        <EquipmentFilterGrid />
      </div>

      {/* Carrusel de Aplicaciones */}
      <div id="aplicaciones">
        <AppCarousel />
      </div>

      {/* CTA para agendar cursos */}
      <div id="cursos">
        <CourseCallout />
      </div>

      {/* Botón flotante de accesibilidad */}
      <AccessibilityButton />
    </>
  );
}
