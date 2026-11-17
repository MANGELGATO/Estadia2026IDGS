'use client';
import SubHeader from './components/SubHeader';
import HeroSection from './components/HeroSection';
import CategoryCarousel from './components/CategoryCarousel';
import EquipmentCarousel from './components/EquipmentCarousel';
import AppCarousel from './components/AppCarousel';
import CourseCallout from './components/CourseCallout';

export default function Home() {

  return (
    <>
      <SubHeader />
      <HeroSection />

      {/* Carrusel de navegación a categorías */}
      <div id="categorias">
        <CategoryCarousel />
      </div>

      {/* Carrusel de vista previa de equipos destacados */}
      <div id="equipos">
        <EquipmentCarousel />
      </div>

      {/* Carrusel de Aplicaciones */}
      <div id="aplicaciones">
        <AppCarousel />
      </div>

      {/* CTA para agendar cursos */}
      <div id="cursos">
        <CourseCallout />
      </div>
    </>
  );
}
