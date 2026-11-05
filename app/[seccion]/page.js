import { notFound, redirect } from 'next/navigation'
import AIPMAWebsite from '../page'

const categorias = {
  nosotros: {
    titulo: 'Quiénes Somos',
    descripcion: 'Conoce la misión, visión y el trabajo internacional de AIPMA por el periodismo.',
  },
  noticias: {
    titulo: 'Noticias',
    descripcion: 'Noticias y novedades de la Alianza Internacional de Periodismo y Medios Audiovisuales.',
  },
  eventos: {
    titulo: 'Eventos y Conferencias',
    descripcion: 'Congresos, conferencias y eventos de AIPMA, incluido el Congreso Anual de Periodismo Avanzado 2026.',
  },
  miembros: {
    titulo: 'Miembros y Alianzas',
    descripcion: 'Información sobre los miembros y alianzas internacionales de AIPMA.',
  },
  contacto: {
    titulo: 'Contacto',
    descripcion: 'Comunícate con la Alianza Internacional de Periodismo y Medios Audiovisuales.',
  },
}

export function generateStaticParams() {
  return Object.keys(categorias).map((seccion) => ({ seccion }))
}

export function generateMetadata({ params }) {
  const categoria = categorias[params.seccion]
  if (!categoria) return { title: 'Página no encontrada | AIPMA' }

  return {
    title: `${categoria.titulo} | AIPMA`,
    description: categoria.descripcion,
    alternates: { canonical: `https://aipma.pro/${params.seccion}` },
  }
}

export default function PaginaCategoria({ params }) {
  if (params.seccion === 'inicio') redirect('/')
  if (!Object.prototype.hasOwnProperty.call(categorias, params.seccion)) notFound()

  return <AIPMAWebsite />
}
