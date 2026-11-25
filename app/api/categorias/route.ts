import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCategoriesConfig,
  getCategoryConfig,
  updateCategoryConfig,
} from '../../../lib/categoriesConfig';
import { requireSession } from '../../../lib/authGuard';
import { logger } from '../../../lib/logger';
import { categoryUpdateSchema } from '../../../lib/validations/schemas';

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
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = categoryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Los datos de configuración de categoría no son válidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id, name, description, plaiUsage, videoUrl, color, benefits, successCases } =
      parsed.data;

    const updated = await updateCategoryConfig(id, {
      name,
      description,
      plaiUsage,
      videoUrl,
      color,
      benefits,
      successCases,
    });

    logger.info('Configuración de categoría actualizada mediante API', {
      id,
      name: updated.name,
      actor: auth.user.email,
    });

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
