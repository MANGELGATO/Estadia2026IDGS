import { describe, it, expect } from 'vitest';
import { reservationSchema, courseRequestSchema, spaceRequestSchema } from './schemas';

describe('Esquemas de Validación Zod (PLAi Sec. 7.2)', () => {
  describe('reservationSchema', () => {
    const validData = {
      deviceId: 'dev-001',
      userName: 'Carlos Santana',
      date: '2026-11-15',
      startTime: '10:00',
      endTime: '11:30',
      activity: 'Taller de Prototipado 3D',
      notes: 'Requiere filamento PETG',
      acceptPrivacy: true,
    };

    it('acepta una reservación válida dentro del límite normativo de 2 horas', () => {
      const result = reservationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rechaza una reservación cuyo préstamo excede las 2 horas reglamentarias', () => {
      const invalidData = {
        ...validData,
        startTime: '10:00',
        endTime: '13:00', // 3 horas
      };

      const result = reservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.flatten().fieldErrors.endTime;
        expect(error?.[0]).toMatch(/tiempo máximo de préstamo es de 2 horas/i);
      }
    });

    it('rechaza si la hora de fin es menor a la hora de inicio', () => {
      const invalidData = {
        ...validData,
        startTime: '14:00',
        endTime: '12:00',
      };

      const result = reservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.flatten().fieldErrors.endTime;
        expect(error?.[0]).toMatch(/posterior a la hora de inicio/i);
      }
    });

    it('rechaza si no se acepta el Aviso de Privacidad institucional', () => {
      const invalidData = {
        ...validData,
        acceptPrivacy: false,
      };

      const result = reservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.acceptPrivacy).toBeDefined();
      }
    });

    it('rechaza nombres menores a 3 caracteres o campos vacíos', () => {
      const invalidData = {
        ...validData,
        userName: 'A',
      };

      const result = reservationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('courseRequestSchema', () => {
    it('valida una solicitud de curso académica con datos completos', () => {
      const result = courseRequestSchema.safeParse({
        courseType: 'academica',
        institution: 'Universidad de Guadalajara',
        contactName: 'Dra. Elena Vargas',
        contactEmail: 'elena.vargas@udg.mx',
        participantsCount: 30,
        preferredDate: '2026-12-01',
      });

      expect(result.success).toBe(true);
    });

    it('rechaza si el correo electrónico es inválido', () => {
      const result = courseRequestSchema.safeParse({
        courseType: 'privada',
        institution: 'Tech Startup',
        contactName: 'Ing. Rodrigo',
        contactEmail: 'not-an-email',
        participantsCount: 10,
        preferredDate: '2026-12-01',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('spaceRequestSchema', () => {
    it('valida una solicitud de espacio cuando se acepta privacidad', () => {
      const result = spaceRequestSchema.safeParse({
        espacioId: 'auditorio',
        nombreSolicitante: 'Lic. Mariana Gómez',
        email: 'mariana.gomez@empresa.com',
        fecha: '2026-11-20',
        hora: '09:00',
        proposito: 'Conferencia Magistral de Innovación',
        acceptPrivacy: true,
      });

      expect(result.success).toBe(true);
    });
  });
});
