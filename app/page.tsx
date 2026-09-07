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
      <CategoryCarousel />

      {/* Grid de dispositivos (solo vista de catálogo) */}
      <EquipmentFilterGrid />

      {/* Carrusel de Aplicaciones */}
      <AppCarousel />

      {/* CTA para agendar cursos */}
      <CourseCallout />

      {/* Botón flotante de accesibilidad */}
      <AccessibilityButton />
    </>
  );
}
