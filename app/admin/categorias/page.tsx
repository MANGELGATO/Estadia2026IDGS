"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RiVideoLine, 
  RiSave3Line, 
  RiExternalLinkLine, 
  RiFileTextLine, 
  RiLightbulbLine, 
  RiListCheck2, 
  RiTrophyLine,
  RiAddLine,
  RiDeleteBinLine,
  RiRefreshLine
} from 'react-icons/ri';
import type { CategoryConfig, SuccessCase } from '../../../lib/categoriesConfig';

const categoryTabs = [
  { id: 'realidad-virtual', name: 'Realidad Virtual', icon: '🥽' },
  { id: 'robotica', name: 'Robótica', icon: '🤖' },
  { id: 'fabricacion-digital', name: 'Fabricación Digital', icon: '🖨️' },
  { id: 'drones', name: 'Drones', icon: '🛸' },
  { id: 'computo-multimedia', name: 'Cómputo / Multimedia', icon: '💻' }
];

export default function CategoriasConfigPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryTabs[0].id);
  const [categoriesData, setCategoriesData] = useState<Record<string, CategoryConfig>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states for active category
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [plaiUsage, setPlaiUsage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [successCases, setSuccessCases] = useState<SuccessCase[]>([]);

  // Carga los datos de una categoría en los campos del formulario
  const loadCategoryIntoForm = (catId: string, sourceData = categoriesData) => {
    const cat = sourceData[catId];
    if (cat) {
      setName(cat.name || '');
      setDescription(cat.description || '');
      setPlaiUsage(cat.plaiUsage || '');
      setVideoUrl(cat.videoUrl || '');
      setBenefits(Array.isArray(cat.benefits) ? [...cat.benefits] : []);
      setSuccessCases(Array.isArray(cat.successCases) ? cat.successCases.map(c => ({ ...c })) : []);
    }
  };

  // 1. Cargar datos desde la API centralizada (/api/categorias)
  useEffect(() => {
    let active = true;
    fetch('/api/categorias')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success && data.categories) {
          setCategoriesData(data.categories);
          const cat = data.categories['realidad-virtual'];
          if (cat) {
            setName(cat.name || '');
            setDescription(cat.description || '');
            setPlaiUsage(cat.plaiUsage || '');
            setVideoUrl(cat.videoUrl || '');
            setBenefits(Array.isArray(cat.benefits) ? [...cat.benefits] : []);
            setSuccessCases(
              Array.isArray(cat.successCases)
                ? cat.successCases.map((c: SuccessCase) => ({ ...c }))
                : []
            );
          }
        }
      })
      .catch(() => {
        if (active) {
          setStatusMessage({ text: 'Error al conectar con el servidor central de categorías.', type: 'error' });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleTabChange = (catId: string) => {
    setSelectedCategory(catId);
    loadCategoryIntoForm(catId);
    setStatusMessage(null);
  };

  // Manejo de Beneficios
  const handleBenefitChange = (index: number, value: string) => {
    const updated = [...benefits];
    updated[index] = value;
    setBenefits(updated);
  };

  const addBenefit = () => {
    setBenefits([...benefits, 'Nuevo beneficio']);
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  // Manejo de Casos de Éxito
  const handleCaseChange = (index: number, field: 'title' | 'desc', value: string) => {
    const updated = [...successCases];
    updated[index] = { ...updated[index], [field]: value };
    setSuccessCases(updated);
  };

  const addSuccessCase = () => {
    setSuccessCases([...successCases, { title: 'Nuevo Caso de Éxito', desc: 'Descripción del impacto o proyecto desarrollado.' }]);
  };

  const removeSuccessCase = (index: number) => {
    setSuccessCases(successCases.filter((_, i) => i !== index));
  };

  // Guardar cambios en el servidor central (Opción B)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      id: selectedCategory,
      name,
      description,
      plaiUsage,
      videoUrl,
      benefits: benefits.filter(b => b.trim().length > 0),
      successCases: successCases.filter(c => c.title.trim().length > 0)
    };

    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success && json.category) {
        // Actualizar estado local central
        const updatedAll = {
          ...categoriesData,
          [selectedCategory]: json.category
        };
        setCategoriesData(updatedAll);

        // Guardar también en localStorage como caché instantáneo para cliente
        if (typeof window !== 'undefined') {
          localStorage.setItem(`category_video_${selectedCategory}`, videoUrl);
        }

        setStatusMessage({
          text: `¡Textos y multimedia de "${name}" guardados exitosamente en el servidor!`,
          type: 'success'
        });
      } else {
        setStatusMessage({
          text: json.message || 'Error al guardar cambios en el servidor.',
          type: 'error'
        });
      }
    } catch {
      setStatusMessage({
        text: 'Error de conexión al persistir la configuración en el servidor.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="flex animate-pop-in flex-col gap-8 pb-16">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">
            Gestor Editorial de Categorías
          </h1>
          <p className="text-sm text-plai-muted md:text-base">
            Administra los textos, secciones institucionales, casos de éxito y videos de cada categoría de PLAi en el servidor central.
          </p>
        </div>

        <Link
          href={`/categoria/${selectedCategory}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-lg border border-plai/30 bg-white px-4 py-2 text-xs font-semibold text-plai shadow-sm transition-all hover:bg-plai/5"
        >
          <RiExternalLinkLine className="text-base" /> Ver página pública
        </Link>
      </div>

      {/* Pestañas de Selección de Categoría */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {categoryTabs.map(tab => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-plai text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl bg-white p-16 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-plai">
            <RiRefreshLine className="size-8 animate-spin" />
            <p className="text-sm font-medium text-gray-600">Cargando datos centralizados...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Columna Principal: Formularios de Texto y Secciones (2 Columnas en lg) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            
            {/* 1. Datos Generales de la Categoría */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                <RiFileTextLine className="text-xl text-plai" />
                <h2 className="font-heading text-lg font-bold text-navy">
                  1. Encabezado y Descripción Principal
                </h2>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Nombre Oficial de la Categoría
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Descripción del Hero (Subtítulo principal)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                    placeholder="Describe el propósito y alcance formativo de los equipos de esta categoría..."
                  />
                  <p className="text-xs text-plai-muted">
                    Este párrafo se muestra destacado en la parte superior de la página pública.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Sección "¿Cómo lo usamos en PLAi?" */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                <RiLightbulbLine className="text-xl text-amber-500" />
                <h2 className="font-heading text-lg font-bold text-navy">
                  2. Sección: &quot;Aplicación en PLAi&quot;
                </h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Párrafo Explicativo Institucional
                </label>
                <textarea
                  rows={4}
                  required
                  value={plaiUsage}
                  onChange={(e) => setPlaiUsage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 transition-all focus:border-plai focus:bg-white focus:outline-none focus:ring-2 focus:ring-plai/20"
                  placeholder="Detalla cómo los laboratorios de PLAi utilizan esta tecnología con emprendedores, empresas y estudiantes..."
                />
                <p className="text-xs text-plai-muted">
                  Argumenta el impacto formativo, reducción de costos o vinculación con la Industria 4.0.
                </p>
              </div>
            </div>

            {/* 3. Beneficios Clave (Viñetas interactivas) */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <RiListCheck2 className="text-xl text-emerald-600" />
                  <h2 className="font-heading text-lg font-bold text-navy">
                    3. Beneficios Destacados
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addBenefit}
                  className="flex cursor-pointer items-center gap-1 rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100"
                >
                  <RiAddLine /> Agregar Beneficio
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => handleBenefitChange(idx, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Eliminar beneficio"
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Casos de Éxito */}
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <RiTrophyLine className="text-xl text-amber-500" />
                  <h2 className="font-heading text-lg font-bold text-navy">
                    4. Casos de Éxito
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addSuccessCase}
                  className="flex cursor-pointer items-center gap-1 rounded-md bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 transition-all hover:bg-amber-100"
                >
                  <RiAddLine /> Agregar Caso
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {successCases.map((c, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy">
                        Caso {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSuccessCase(idx)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                      >
                        <RiDeleteBinLine /> Eliminar
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Título del Caso (ej: Recorrido Arquitectónico)"
                        value={c.title}
                        onChange={(e) => handleCaseChange(idx, 'title', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                      />
                      <textarea
                        rows={2}
                        placeholder="Descripción corta del proyecto o impacto logrado..."
                        value={c.desc}
                        onChange={(e) => handleCaseChange(idx, 'desc', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Lateral: Multimedia (Video YouTube), Vista Previa y Botón Guardar */}
          <div className="flex flex-col gap-6">
            
            {/* Tarjeta de Acción: Guardar Cambios */}
            <div className="sticky top-24 flex flex-col gap-6">
              <div className="rounded-2xl border border-plai/20 bg-white p-6 shadow-md">
                <h3 className="mb-2 font-heading text-base font-bold text-navy">
                  Publicar en Servidor
                </h3>
                <p className="mb-5 text-xs leading-relaxed text-plai-muted">
                  Los cambios se guardan de forma centralizada en el servidor, actualizando inmediatamente la vista de todos los visitantes.
                </p>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-plai py-3 text-sm font-bold text-white shadow-lg shadow-plai/25 transition-all hover:bg-plai-hover disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RiRefreshLine className="animate-spin text-lg" />
                      <span>Guardando en servidor...</span>
                    </>
                  ) : (
                    <>
                      <RiSave3Line className="text-lg" />
                      <span>Guardar Todo en el Servidor</span>
                    </>
                  )}
                </button>

                {statusMessage && (
                  <div
                    className={`mt-4 rounded-lg p-3 text-xs font-semibold animate-pop-in ${
                      statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}
              </div>

              {/* Tarjeta de Configuración de Video YouTube */}
              <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <RiVideoLine className="text-lg text-plai" />
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-navy">
                    Video de Casos de Éxito
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-700">
                    URL de YouTube
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                  />
                  <p className="text-[0.72rem] text-plai-muted leading-tight">
                    Puedes pegar enlaces normales de YouTube (`watch?v=...`) o compartidos (`youtu.be/...`).
                  </p>
                </div>

                {/* Vista previa embebida del video */}
                <div className="mt-4">
                  <span className="mb-2 block text-xs font-bold text-navy">Vista Previa:</span>
                  {videoUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={
                          videoUrl.includes('watch?v=')
                            ? videoUrl.replace('watch?v=', 'embed/')
                            : videoUrl.includes('youtu.be/')
                            ? videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                            : videoUrl
                        }
                        title="Vista previa del video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-xs text-plai-muted">
                      Sin video configurado
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}
