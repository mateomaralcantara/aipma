'use client'

import { useState } from 'react'

// Fotografías de contexto: nunca se presentan como registro visual de
// actividades realizadas por AIPMA. Se antepone la imagen oficial de cada ficha.
export const FOTOS_EDITORIALES = {
  conferencia: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop&q=80',
  taller: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
  equipo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop&q=80',
  datos: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
  prensa: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80',
  digital: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
  investigacion: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
}

const catalogo = Object.values(FOTOS_EDITORIALES)

export function fotografiaPorTema(texto = '') {
  const t = String(texto ?? '').toLocaleLowerCase('es')
  if (/congreso|conferencia|disertaci[oó]n|seminario|ponencia|convenci[oó]n/.test(t)) return FOTOS_EDITORIALES.conferencia
  if (/taller|formaci[oó]n|capacitaci[oó]n|educaci[oó]n/.test(t)) return FOTOS_EDITORIALES.taller
  if (/dato|estad[ií]stica|investiga|fuentes abiertas/.test(t)) return FOTOS_EDITORIALES.datos
  if (/digital|inteligencia artificial|tecnolog[ií]a|innovaci[oó]n|redes/.test(t)) return FOTOS_EDITORIALES.digital
  if (/libertad de prensa|periodismo|periodista|noticia|informaci[oó]n/.test(t)) return FOTOS_EDITORIALES.prensa
  if (/reuni[oó]n|directiva|miembros|alianza|cooperaci[oó]n/.test(t)) return FOTOS_EDITORIALES.equipo

  const indice = [...t].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7) % catalogo.length
  return catalogo[indice]
}

export function imagenDeRegistro(registro) {
  const candidatos = [
    registro?.imagen_url,
    registro?.imagenUrl,
    registro?.imagenDestacada,
    registro?.imagen_destacada,
    registro?.imagen,
    registro?.foto_url,
    registro?.foto,
    registro?.portada,
    registro?.image,
  ]
  return candidatos.find(v => typeof v === 'string' && (/^https:\/\//i.test(v.trim()) || /^\/(?!\/)/.test(v.trim())))?.trim() || null
}

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
  const esIlustrativa = !usarOriginal

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
