'use client'

import { useState } from 'react'

import { fotografiaPorTema } from '@/lib/fotos-editoriales'

/**
 * Ficha visual reutilizable para noticias, actividades y cronologías.
 * Los recursos de Unsplash se señalan como ilustrativos.
 */
export default function ImagenEditorial({
  imagen,
  titulo = 'Periodismo y comunicación',
  categoria = '',
  className = 'h-48 sm:h-56',
  prioridad = false,
  ilustrativa = false,
}) {
  const imagenPropia = typeof imagen === 'string' &&
    (/^https:\/\//i.test(imagen.trim()) || /^\/(?!\/)/.test(imagen.trim()))
    ? imagen.trim()
    : null

  const alternativa = fotografiaPorTema([titulo, categoria].filter(Boolean).join(' · '))
  const [principalFallida, setPrincipalFallida] = useState(false)
  const [alternativaFallida, setAlternativaFallida] = useState(false)
  const usarOriginal = Boolean(imagenPropia) && !principalFallida
  const src = usarOriginal ? imagenPropia : alternativa
  const noDisponible = alternativaFallida && !usarOriginal
  const esIlustrativa = ilustrativa || !usarOriginal

  return (
    <figure className={`relative w-full overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 ${className}`}>
      {!noDisponible && (
        <img
          src={src}
          alt={esIlustrativa ? `Imagen ilustrativa sobre ${titulo}` : `Imagen de ${titulo}`}
          className="h-full w-full object-cover"
          loading={prioridad ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => usarOriginal ? setPrincipalFallida(true) : setAlternativaFallida(true)}
        />
      )}
      {noDisponible && (
        <div className="flex h-full w-full items-center justify-center px-5 text-center text-lg font-bold text-white/90">
          AIPMA · Periodismo y medios audiovisuales
        </div>
      )}
      {esIlustrativa && (
        <figcaption className="absolute bottom-2 right-2 rounded bg-slate-950/80 px-2 py-1 text-[10px] font-medium text-white">
          Imagen ilustrativa · Unsplash
        </figcaption>
      )}
    </figure>
  )
}
