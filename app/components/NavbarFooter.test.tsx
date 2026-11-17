import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';
import Footer from './Footer';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe('Navbar Component', () => {
  it('contiene las secciones en el orden correcto y sin Contacto', () => {
    render(<Navbar />);

    const links = screen.getAllByRole('link');
    const linkTexts = links.map((l) => l.textContent?.trim()).filter(Boolean);

    // Debe contener las secciones solicitadas
    expect(linkTexts).toContain('Inicio');
    expect(linkTexts).toContain('Categorías');
    expect(linkTexts).toContain('Equipos');
    expect(linkTexts).toContain('Aplicaciones');
    expect(linkTexts).toContain('Espacios');

    // No debe contener "Contacto"
    expect(linkTexts).not.toContain('Contacto');

    // Comprobar orden relativo de las secciones principales
    const inicioIdx = linkTexts.indexOf('Inicio');
    const catIdx = linkTexts.indexOf('Categorías');
    const eqIdx = linkTexts.indexOf('Equipos');
    const appIdx = linkTexts.indexOf('Aplicaciones');
    const espIdx = linkTexts.indexOf('Espacios');

    expect(inicioIdx).toBeLessThan(catIdx);
    expect(catIdx).toBeLessThan(eqIdx);
    expect(eqIdx).toBeLessThan(appIdx);
    expect(appIdx).toBeLessThan(espIdx);
  });
});

describe('Footer Component', () => {
  it('renderiza la marca Aprender, la leyenda editable y redes sociales', () => {
    render(<Footer />);

    expect(screen.getByText('Aprender')).toBeInTheDocument();
    expect(screen.getByText(/Sección \/ Leyenda sujeta a edición institucional de PLAi/i)).toBeInTheDocument();

    // Redes sociales
    expect(screen.getByLabelText('Facebook')).toHaveAttribute('href', expect.stringContaining('facebook.com'));
    expect(screen.getByLabelText('X (Twitter)')).toHaveAttribute('href', expect.stringContaining('x.com'));
    expect(screen.getByLabelText('Instagram')).toHaveAttribute('href', expect.stringContaining('instagram.com'));
    expect(screen.getByLabelText('YouTube')).toHaveAttribute('href', expect.stringContaining('youtube.com'));
    expect(screen.getByLabelText('LinkedIn')).toHaveAttribute('href', expect.stringContaining('linkedin.com'));
  });

  it('reproduce la navegación del header en el footer', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { name: /Navegación/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Categorías' })).toHaveAttribute('href', '/categorias');
    expect(screen.getByRole('link', { name: 'Equipos' })).toHaveAttribute('href', '/equipos');
    expect(screen.getByRole('link', { name: 'Aplicaciones' })).toHaveAttribute('href', '/aplicaciones');
    expect(screen.getByRole('link', { name: 'Espacios' })).toHaveAttribute('href', '/espacios');
  });

  it('muestra la información oficial de ubicación y canales de contacto', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { name: /Ubicación/i })).toBeInTheDocument();
    expect(screen.getByText(/C\. Independencia 55, Guadalajara, Jalisco, Ciudad Creativa Digital/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /Contacto/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'plai.ayuda@plai.mx' })).toHaveAttribute('href', 'mailto:plai.ayuda@plai.mx');
    expect(screen.getByRole('link', { name: '+52 33 1410 1620' })).toHaveAttribute('href', 'tel:+523314101620');
    expect(screen.getByRole('link', { name: 'Whatsapp PLAi' })).toHaveAttribute('href', 'https://wa.me/523314101620');
  });

  it('incluye los logos institucionales oficiales del footerimg', () => {
    render(<Footer />);

    expect(screen.getByAltText('Ciudad Creativa Digital')).toBeInTheDocument();
    expect(screen.getByAltText('Plataforma Abierta de Innovación')).toBeInTheDocument();
    expect(screen.getByAltText('Innovación, Ciencia y Tecnología')).toBeInTheDocument();
    expect(screen.getByAltText('Coordinación de Crecimiento y Desarrollo Económico')).toBeInTheDocument();
    expect(screen.getByAltText('Al Estilo Jalisco')).toBeInTheDocument();
  });

  it('cuenta con el enlace oficial de Aviso de Privacidad y Horarios de atención', () => {
    render(<Footer />);

    const privacyLink = screen.getByRole('link', { name: /Aviso de privacidad/i });
    expect(privacyLink).toHaveAttribute('href', 'https://plai.mx/aviso-de-privacidad');
    expect(privacyLink).toHaveAttribute('target', '_blank');

    expect(screen.getByText('Horarios de atención')).toBeInTheDocument();
    expect(screen.getByText(/Lunes - Viernes: 9:00 AM - 5:00 PM/i)).toBeInTheDocument();
    expect(screen.getByText(/Sábados - Domingos: Cerrado/i)).toBeInTheDocument();
  });
});
