import CategoryClient from './client';

export function generateStaticParams() {
  return [
    { slug: 'realidad-virtual' },
    { slug: 'robotica' },
    { slug: 'fabricacion-digital' },
    { slug: 'drones' },
    { slug: 'computo-multimedia' }
  ];
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CategoryClient params={params} />;
}
