import AgendarCursoClient from './client';

export function generateStaticParams() {
  return [
    { type: 'institucion' },
    { type: 'empresa' }
  ];
}

export default function AgendarCursoPage({ params }: { params: Promise<{ type: string }> }) {
  return <AgendarCursoClient params={params} />;
}
