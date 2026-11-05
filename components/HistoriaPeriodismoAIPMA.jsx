const etapas = [
  {
    anio: '2021',
    eje: 'Información confiable en tiempos de crisis',
    descripcion: 'La pandemia consolidó una exigencia esencial: explicar decisiones públicas y datos sanitarios sin sacrificar precisión. La UNESCO documentó presiones sobre la libertad de prensa y una expansión de la desinformación. Para el periodismo, la lección fue fortalecer la comprobación de fuentes, la transparencia y la protección del derecho a informar.',
    lectura: 'UNESCO · Tendencias mundiales de libertad de expresión 2021/2022',
    enlace: 'https://www.unesco.org/reports/world-media-trends/2021/en/global-trends',
  },
  {
    anio: '2022',
    eje: 'La confianza y la fatiga informativa',
    descripcion: 'La audiencia comenzó a mostrar con más claridad un problema doble: una oferta informativa permanente y un mayor deseo de evitar las noticias. El Digital News Report 2022 observó retrocesos en el interés y la confianza, junto con un consumo creciente a través de plataformas. El desafío profesional dejó de ser solo llegar primero: también había que explicar mejor.',
    lectura: 'Instituto Reuters · Digital News Report 2022',
    enlace: 'https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2022',
  },
  {
    anio: '2023',
    eje: 'Periodismo multiplataforma y nuevos intermediarios',
    descripcion: 'El video y las redes de distribución cobraron más peso en el acceso a las noticias, especialmente entre públicos jóvenes. El trabajo periodístico tuvo que adaptarse a formatos breves, contenido móvil y nuevas formas de relación con las comunidades. Al mismo tiempo, el auge de herramientas generativas hizo imprescindible revisar los métodos de edición y verificación.',
    lectura: 'Instituto Reuters · Digital News Report 2023',
    enlace: 'https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2023',
  },
  {
    anio: '2024',
    eje: 'Inteligencia artificial, redes visuales y desinformación',
    descripcion: 'Los medios afrontaron la expansión de creadores informativos y redes orientadas al video, mientras la inteligencia artificial empezó a transformar las redacciones. Los estudios internacionales subrayaron la preocupación del público ante los contenidos engañosos. La calidad editorial requería identificar fuentes, explicar cuándo se utiliza IA y conservar supervisión humana.',
    lectura: 'Instituto Reuters · Digital News Report 2024',
    enlace: 'https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2024',
  },
  {
    anio: '2025',
    eje: 'Sostenibilidad de los medios y credibilidad',
    descripcion: 'La fragmentación de audiencias y el estancamiento de determinadas fuentes de ingresos agudizaron la búsqueda de modelos sostenibles. El Instituto Reuters describió un ecosistema en el que las plataformas sociales y de video ganaban terreno frente a los canales tradicionales. Para las organizaciones profesionales, la formación continua, la colaboración y las normas éticas se volvieron prioridades estratégicas.',
    lectura: 'Instituto Reuters · Digital News Report 2025',
    enlace: 'https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025',
  },
  {
    anio: '2026',
    eje: 'La posverdad y la nueva etapa de la comunicación',
    descripcion: 'La circulación de noticias mediante redes, video y asistentes de IA acelera la distancia entre producir un contenido y demostrar que es verdadero. El Digital News Report 2026 documentó que, en el promedio de 48 mercados, las redes sociales y de video se convirtieron en el acceso más utilizado a noticias en línea. Esta transformación hace más urgente una cultura de pruebas, contexto, corrección pública y responsabilidad editorial.',
    lectura: 'Instituto Reuters · Digital News Report 2026',
    enlace: 'https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/dnr-executive-summary',
  },
]

export default function HistoriaPeriodismoAIPMA({ resumen = false }) {
  const visibles = resumen ? etapas.slice(-3) : etapas

  return (
    <section aria-labelledby="historia-periodismo-aipma" className="my-12 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-800">Archivo de análisis · 2021–2026</p>
      <h2 id="historia-periodismo-aipma" className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
        Cinco años que transformaron el periodismo
      </h2>
      <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-700 sm:text-base">
        Del impacto de la pandemia a la expansión de la inteligencia artificial, el periodismo ha atravesado una transformación profunda. La defensa de la libertad de prensa, la verificación de información, la adaptación a los nuevos formatos y la confianza de las audiencias se han convertido en desafíos conectados. Esta cronología examina el contexto profesional en el que AIPMA desarrolla su misión de promover ética, formación y cooperación periodística.
      </p>
      <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">
        Nota documental: los hechos de 2021–2025 se refieren a tendencias del periodismo internacional, respaldadas por las fuentes enlazadas; no constituyen un registro de actividades realizadas por AIPMA en esos años.
      </p>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {visibles.map(({ anio, eje, descripcion, lectura, enlace }) => (
          <article key={anio} className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <span className="text-2xl font-extrabold text-blue-800">{anio}</span>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{eje}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{descripcion}</p>
            <a href={enlace} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-xs font-semibold text-blue-800 underline decoration-blue-300 underline-offset-2 hover:text-blue-600">
              Fuente: {lectura}
            </a>
          </article>
        ))}
      </div>
      {!resumen && (
        <div className="mt-7 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="text-lg font-bold text-blue-950">AIPMA ante el periodismo de la nueva era</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            La Alianza Internacional de Periodismo y Medios Audiovisuales sitúa la ética, la credibilidad y la colaboración profesional entre sus ejes institucionales. Su programa de la 5.ª entrega del Congreso Anual de Periodismo Avanzado, previsto para el 10 y 11 de diciembre de 2026 en Hazleton, Pennsylvania, propone reflexionar sobre la posverdad en la era de la inteligencia artificial, los desafíos de la comunicación contemporánea y la expansión de su directiva. El programa contempla también reconocimientos a miembros destacados y una distinción especial a ACTUALIZARD.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Base institucional: itinerario del Congreso AIPMA 2026 y comunicación de invitación emitida en marzo de 2026. Se trata de documentación de una actividad programada, no de una constancia de realización.
          </p>
        </div>
      )}
    </section>
  )
}
