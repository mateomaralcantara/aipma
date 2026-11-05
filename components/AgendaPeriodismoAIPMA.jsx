// Propuesta de agenda editorial: una actividad documentada y cinco iniciativas
// sujetas a aprobación institucional. No anunciar propuestas como confirmadas.
export const agendaPeriodismo = [
  {
    id: 'aipma-nov-2026',
    fecha: '21 de noviembre de 2026',
    etiqueta: '21 NOV 2026',
    titulo: 'Taller de periodismo responsable y verificación digital',
    tema: 'Cómo investigar, contrastar afirmaciones, consultar fuentes primarias y rectificar errores en la era de la viralidad.',
    formato: 'Taller formativo · modalidad y sede por definir',
    resultado: 'Propuesta de guía práctica de verificación y protocolo de correcciones.',
    estado: 'propuesta',
  },
  {
    id: 'aipma-congreso-2026',
    fecha: '10 y 11 de diciembre de 2026',
    etiqueta: '10–11 DIC 2026',
    titulo: '5.ª entrega del Congreso Anual de Periodismo Avanzado',
    tema: 'Periodismo en la nueva era de la comunicación. Incluye la ponencia «La posverdad en la era de la inteligencia artificial», a cargo de Justin Colins, y sesiones sobre retos institucionales, comunicación y reconocimientos.',
    formato: 'Encuentro presencial previsto · 1 Broad Street, Hazleton, Pennsylvania, EE. UU.',
    resultado: 'Intercambio profesional, propuestas institucionales y reconocimientos contemplados en el programa.',
    estado: 'programado',
  },
  {
    id: 'aipma-12-dic-2026',
    fecha: '12 de diciembre de 2026',
    etiqueta: '12 DIC 2026',
    titulo: 'Jornada de seguimiento: compromisos para un periodismo creíble',
    tema: 'Mesa técnica posterior al congreso para sintetizar propuestas sobre ética, inteligencia artificial, cooperación profesional y fortalecimiento institucional.',
    formato: 'Jornada de trabajo propuesta · sede y horario por definir',
    resultado: 'Borrador de hoja de ruta 2027 y acuerdos sujetos a validación de la directiva.',
    estado: 'propuesta',
  },
  {
    id: 'aipma-ene-2027',
    fecha: '23 de enero de 2027',
    etiqueta: '23 ENE 2027',
    titulo: 'Seminario de periodismo de datos y fuentes abiertas',
    tema: 'Documentos públicos, análisis de datos, investigaciones reproducibles, transparencia y trazabilidad de evidencias.',
    formato: 'Seminario propuesto · modalidad por definir',
    resultado: 'Propuesta de laboratorio de periodismo de datos y plantillas para documentar investigaciones.',
    estado: 'propuesta',
  },
  {
    id: 'aipma-feb-2027',
    fecha: '20 de febrero de 2027',
    etiqueta: '20 FEB 2027',
    titulo: 'Foro sobre libertad de prensa y seguridad de periodistas',
    tema: 'Protección digital, amenazas, integridad profesional, derechos y mecanismos de apoyo para comunicadores.',
    formato: 'Foro propuesto · modalidad y sede por definir',
    resultado: 'Propuesta de recomendaciones y protocolo básico de seguridad periodística.',
    estado: 'propuesta',
  },
  {
    id: 'aipma-mar-2027',
    fecha: '20 de marzo de 2027',
    etiqueta: '20 MAR 2027',
    titulo: 'Encuentro de innovación, sostenibilidad e inteligencia artificial en los medios',
    tema: 'Modelos editoriales sostenibles, herramientas de IA con supervisión humana, nuevas audiencias y alfabetización mediática.',
    formato: 'Encuentro propuesto · modalidad y sede por definir',
    resultado: 'Propuesta de programa de formación y agenda de cooperación para 2027.',
    estado: 'propuesta',
  },
]

export default function AgendaPeriodismoAIPMA() {
  return (
    <section aria-labelledby="agenda-aipma-2027" className="mb-12 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-800">
        Agenda de trabajo · Noviembre de 2026 a marzo de 2027
      </p>
      <h2 id="agenda-aipma-2027" className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
        Seis actividades para fortalecer el periodismo
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        El Congreso del 10 y 11 de diciembre está respaldado por un programa institucional. Las otras cinco jornadas son una propuesta de calendario que deberá aprobar AIPMA antes de anunciar convocatorias o inscripciones. En particular, la jornada del 12 de diciembre es una propuesta adicional y no forma parte del itinerario oficial actual.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {agendaPeriodismo.map((actividad, index) => {
          const documentada = actividad.estado === 'programado'
          return (
            <article key={actividad.id} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold tracking-wide text-blue-900">{actividad.etiqueta}</span>
                <span className={documentada
                  ? 'rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-900'
                  : 'rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700'}>
                  {documentada ? 'Programa institucional' : 'Propuesta por aprobar'}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{actividad.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{actividad.tema}</p>
              <p className="mt-3 text-xs font-semibold text-blue-900">{actividad.formato}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">Resultado previsto: {actividad.resultado}</p>
              {documentada && <a href="#congreso-aipma-2026" className="mt-4 text-xs font-semibold text-blue-800 underline underline-offset-2">Ver programa del congreso</a>}
              {!documentada && <p className="mt-4 text-xs text-slate-500">Fecha tentativa; no existe convocatoria abierta.</p>}
            </article>
          )
        })}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-slate-600">
        Las actividades propuestas no acreditan que la organización haya aprobado presupuestos, invitados, sedes o participantes. Su eventual publicación como convocatorias requiere autorización institucional.
      </p>
    </section>
  )
}
