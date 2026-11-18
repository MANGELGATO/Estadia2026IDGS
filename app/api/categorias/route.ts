import { NextRequest, NextResponse } from 'next/server';
import { getAllCategoriesConfig, getCategoryConfig, updateCategoryConfig } from '../../../lib/categoriesConfig';
import { logger } from '../../../lib/logger';
import { requireSession } from '../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const category = await getCategoryConfig(slug);
      if (!category) {
        return NextResponse.json(
          { success: false, message: `Categoría no encontrada: ${slug}` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        category,
      });
    }

    const categories = await getAllCategoriesConfig();
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    logger.error('Error al consultar configuración de categorías', { path: '/api/categorias' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar categorías' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req, 'admin');
  if (!auth.ok) return auth.response;
  try {
    const body = await req.json();
    const { id, name, description, plaiUsage, videoUrl, benefits, successCases } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'El identificador (id/slug) de la categoría es requerido' },
        { status: 400 }
      );
    }

    const updated = await updateCategoryConfig(id, {
      name: typeof name === 'string' ? name.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : undefined,
      plaiUsage: typeof plaiUsage === 'string' ? plaiUsage.trim() : undefined,
      videoUrl: typeof videoUrl === 'string' ? videoUrl.trim() : undefined,
      benefits: Array.isArray(benefits) ? benefits.map((b: string) => String(b).trim()).filter(Boolean) : undefined,
      successCases: Array.isArray(successCases)
        ? successCases.map((c: { title?: string; desc?: string }) => ({
            title: String(c.title || '').trim(),
            desc: String(c.desc || '').trim(),
          })).filter(c => c.title.length > 0)
        : undefined,
    });

    logger.info('Configuración de categoría actualizada mediante API', { id, name: updated.name });

    return NextResponse.json({
      success: true,
      message: `Configuración de ${updated.name} actualizada correctamente en el servidor`,
      category: updated,
    });
  } catch (error) {
    logger.error('Error al actualizar configuración de categoría', { path: '/api/categorias' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al actualizar la categoría' },
      { status: 500 }
    );
  }
}
