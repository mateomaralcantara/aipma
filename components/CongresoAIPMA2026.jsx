import ImagenEditorial, { FOTOS_EDITORIALES } from '@/components/ImagenEditorial'

const jueves = [
  { hora: '11:00 a. m.*', titulo: 'Recepción de las delegaciones' },
  { hora: '12:30 p. m.', titulo: 'Reconfirmación de asistencia' },
  { hora: '1:15 p. m.', titulo: 'Almuerzo' },
  {
    hora: '2:30 p. m.',
    titulo: 'Primera disertación',
    detalle: 'La posverdad en la era de la inteligencia artificial',
    expositor: 'Justin Colins',
  },
  { hora: '6:30 p. m.', titulo: 'Recepción en el hotel' },
]

const viernes = [
  { hora: '10:00 a. m.', titulo: 'Propuestas para la expansión de la directiva y retos de la institución' },
  { hora: '12:45 p. m.', titulo: 'Almuerzo' },
  {
    hora: '2:00–4:00 p. m.',
    titulo: 'Segunda disertación',
    detalle: 'Periodismo en la nueva era de la comunicación 2026',
  },
  { hora: 'Por confirmar', titulo: 'Reconocimiento a miembros destacados de varios países' },
  {
    hora: 'Por confirmar',
    titulo: 'Reconocimiento especial a ACTUALIZARD',
    detalle: 'Entidad invitada especial del encuentro',
  },
]

function Jornada({ numero, fecha, actividades }) {
  return (
    <section className="overflow-hidden rounded-xl border border-blue-100 bg-white" aria-label={fecha}>
      <h3 className="flex items-center gap-4 bg-[#073b86] px-5 py-4 font-bold uppercase tracking-wide text-white">
        <span className="rounded-md bg-white/15 px-2.5 py-1 text-sm">{numero}</span>
        <span className="text-sm sm:text-base">{fecha}</span>
      </h3>
      <ol className="divide-y divide-blue-100">
        {actividades.map(({ hora, titulo, detalle, expositor }, indice) => (
          <li key={numero + '-' + indice} className="grid gap-1 bg-white px-5 py-3.5 even:bg-blue-50/70 sm:grid-cols-[145px_minmax(0,1fr)] sm:gap-5">
            <span className="text-sm font-bold text-blue-800">{hora}</span>
            <div>
              <p className="font-semibold text-slate-900">{titulo}</p>
              {detalle && <p className="mt-1 text-sm text-slate-700">{detalle}</p>}
              {expositor && <p className="mt-1 text-sm text-slate-600">Exponente: {expositor}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function CongresoAIPMA2026() {
  return (
    <section aria-labelledby="congreso-aipma-2026" className="mb-12 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-lg">
      <div className="bg-gradient-to-br from-[#052b69] via-[#074394] to-[#1059b3] px-6 py-9 text-white sm:px-10">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-blue-100 sm:text-sm">
          <span>5.ª entrega · Congreso anual</span>
          <span className="rounded-full border border-white/40 bg-white/10 px-3 py-1">10 y 11 de diciembre de 2026</span>
        </div>
        <h2 id="congreso-aipma-2026" className="text-3xl font-extrabold leading-tight sm:text-4xl">Periodismo avanzado</h2>
        <p className="mt-3 max-w-3xl text-xl font-semibold leading-snug text-blue-50 sm:text-2xl">
          Periodismo en la nueva era de la comunicación
        </p>
        <p className="mt-4 text-sm text-blue-100">Itinerario oficial de actividades · Hazleton, Pennsylvania, Estados Unidos</p>
      </div>

      <ImagenEditorial imagen={FOTOS_EDITORIALES.conferencia} ilustrativa titulo="Congreso Anual de Periodismo Avanzado" className="h-52 sm:h-72" />

      <div className="space-y-7 bg-gradient-to-b from-blue-50/70 to-white px-4 py-7 sm:px-8 sm:py-9">
        <Jornada numero="01" fecha="Jueves 10 de diciembre de 2026" actividades={jueves} />
        <Jornada numero="02" fecha="Viernes 11 de diciembre de 2026" actividades={viernes} />

        <div className="rounded-xl border border-blue-100 bg-white p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-wider text-blue-800">Sede del encuentro</p>
          <p className="mt-2 font-semibold text-slate-900">1 Broad Street, Hazleton, Pennsylvania, Estados Unidos</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-600">
            * Horario por confirmar: la recepción de delegaciones figura provisionalmente a las 11:00 a. m., sujeto a confirmación de la organización.
          </p>
          <a
            href="mailto:aipma070281@gmail.com?subject=Informaci%C3%B3n%20del%20Congreso%20AIPMA%202026"
            className="mt-5 inline-flex items-center rounded-lg bg-[#074394] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#052b69] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Solicitar información del congreso
          </a>
        </div>
      </div>
    </section>
  )
}
