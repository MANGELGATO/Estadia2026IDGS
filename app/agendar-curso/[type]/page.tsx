import AgendarCursoClient from './client';

export function generateStaticParams() {
  return [
    { type: 'academica' },
    { type: 'privada' }
  ];
}

export default function AgendarCursoPage({ params }: { params: Promise<{ type: string }> }) {
  return <AgendarCursoClient params={params} />;
}
