'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UsersIcon, NewspaperIcon, Globe, MailIcon, MenuIcon, XIcon } from 'lucide-react'

// ---- supabase client (solo si hay envs públicas) ----
const supabase =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null

// navegación constante (no se recrea en cada render)
const navigation = [
  { id: 'inicio', label: 'Inicio', icon: Globe },
  { id: 'nosotros', label: 'Quiénes Somos', icon: UsersIcon },
  { id: 'noticias', label: 'Noticias', icon: NewspaperIcon },
  { id: 'eventos', label: 'Eventos', icon: CalendarIcon },
  { id: 'miembros', label: 'Miembros', icon: UsersIcon },
  { id: 'contacto', label: 'Contacto', icon: MailIcon }
]

function AIPMAWebsite() {
  const [activeSection, setActiveSection] = useState('inicio')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [noticias, setNoticias] = useState([])
  const [eventos, setEventos] = useState([])
  const [miembros, setMiembros] = useState([])
  const [loading, setLoading] = useState(true)

  // === NUEVO: estado para formularios ===
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [formMember, setFormMember] = useState({
    nombre: '', organizacion: '', especialidad: '', pais: '', tipo: 'periodista', fechaIngreso: ''
  })
  const [newsletterEmail, setNewsletterEmail] = useState('')

  // formatters memoizados
  const fmtLong = useMemo(() => new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), [])
  const fmtShort = useMemo(() => new Intl.DateTimeFormat('es-ES'), [])

  // ---- helpers: fetch desde supabase o API ----
  const fetchFromSupabase = useCallback(async () => {
    if (!supabase) return null
    const [nq, eq, mq] = await Promise.all([
      supabase.from('noticias').select('*').order('fecha', { ascending: false }),
      supabase.from('eventos').select('*').order('fecha', { ascending: true }),
      supabase.from('miembros').select('*').order('fechaIngreso', { ascending: false })
    ])
    if (nq.error || eq.error || mq.error) return null
    return {
      noticias: nq.data || [],
      eventos: eq.data || [],
      miembros: mq.data || []
    }
  }, [])

  const fetchFromAPI = useCallback(async () => {
    const [noticiasRes, eventosRes, miembrosRes] = await Promise.allSettled([
      fetch('/api/noticias'),
      fetch('/api/eventos'),
      fetch('/api/miembros')
    ])

    const safeJSON = async (res) => (res && res.ok ? res.json() : null)

    const noticiasData = noticiasRes.status === 'fulfilled' ? await safeJSON(noticiasRes.value) : null
    const eventosData  = eventosRes.status  === 'fulfilled' ? await safeJSON(eventosRes.value)  : null
    const miembrosData = miembrosRes.status === 'fulfilled' ? await safeJSON(miembrosRes.value) : null

    return {
      noticias: (noticiasData && noticiasData.noticias) || [],
      eventos:  (eventosData  && eventosData.eventos)  || [],
      miembros: (miembrosData && miembrosData.miembros) || []
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // primero intentamos supabase; si no, caemos a API
      const fromSb = await fetchFromSupabase()
      const data = fromSb ?? await fetchFromAPI()
      setNoticias(Array.isArray(data.noticias) ? data.noticias : [])
      setEventos(Array.isArray(data.eventos) ? data.eventos : [])
      setMiembros(Array.isArray(data.miembros) ? data.miembros : [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchFromAPI, fetchFromSupabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ---- realtime: si supabase está disponible, escucha cambios ----
  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('aipma-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'noticias' }, async () => {
        const { data, error } = await supabase.from('noticias').select('*').order('fecha', { ascending: false })
        if (!error && data) setNoticias(data)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, async () => {
        const { data, error } = await supabase.from('eventos').select('*').order('fecha', { ascending: true })
        if (!error && data) setEventos(data)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'miembros' }, async () => {
        const { data, error } = await supabase.from('miembros').select('*').order('fechaIngreso', { ascending: false })
        if (!error && data) setMiembros(data)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const contactData = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      mensaje: formData.get('mensaje'),
      fecha: new Date(),
      leido: false
    }

    try {
      // primero intentamos directo a supabase (RLS debe permitir insert)
      if (supabase) {
        const { error } = await supabase.from('mensajes').insert([contactData])
        if (!error) {
          alert('Mensaje enviado exitosamente')
          e.target.reset()
          return
        }
      }
      // fallback a la API
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: contactData.nombre,
          email: contactData.email,
          mensaje: contactData.mensaje
        })
      })
      if (response.ok) {
        alert('Mensaje enviado exitosamente')
        e.target.reset()
      } else {
        alert('Error al enviar el mensaje')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar el mensaje')
    }
  }

  // === NUEVO: crear miembro ===
  const handleCreateMember = async (e) => {
    e.preventDefault()
    const payload = {
      ...formMember,
      id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)),
      fechaIngreso: formMember.fechaIngreso ? new Date(formMember.fechaIngreso) : new Date(),
      fechaCreacion: new Date()
    }
    try {
      if (supabase) {
        const { data, error } = await supabase.from('miembros').insert([payload]).select('*')
        if (!error) {
          const nuevo = Array.isArray(data) && data[0] ? data[0] : payload
          setMiembros((prev) => [nuevo, ...prev])
          setShowMemberForm(false)
          setFormMember({ nombre:'', organizacion:'', especialidad:'', pais:'', tipo:'periodista', fechaIngreso:'' })
          alert('Solicitud enviada ✅')
          return
        }
      }
      // fallback API
      const res = await fetch('/api/miembros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const { miembro } = await res.json()
        setMiembros((prev) => [miembro ?? payload, ...prev])
        setShowMemberForm(false)
        setFormMember({ nombre:'', organizacion:'', especialidad:'', pais:'', tipo:'periodista', fechaIngreso:'' })
        alert('Solicitud enviada ✅')
      } else {
        alert('No se pudo enviar la solicitud')
      }
    } catch (err) {
      console.error(err)
      alert('Error creando miembro')
    }
  }

  // === NUEVO: newsletter ===
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!newsletterEmail) return
    const entry = { nombre: null, email: newsletterEmail, mensaje: 'newsletter', tipo: 'newsletter', fecha: new Date(), leido: false }
    try {
      if (supabase) {
        const { error } = await supabase.from('mensajes').insert([entry])
        if (!error) {
          setNewsletterEmail('')
          alert('Suscripción realizada ✅')
          return
        }
      }
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Newsletter', email: newsletterEmail, mensaje: 'Suscripción newsletter' })
      })
      if (res.ok) {
        setNewsletterEmail('')
        alert('Suscripción realizada ✅')
      } else {
        alert('No se pudo suscribir')
      }
    } catch (err) {
      console.error(err)
      alert('Error en la suscripción')
    }
  }

  // === NUEVO: registro a evento (guarda intención) ===
  const handleEventRegister = async (evento) => {
    const entry = {
      nombre: null,
      email: null,
      mensaje: `registro_evento:${evento?.id ?? ''}`,
      tipo: 'registro_evento',
      fecha: new Date(),
      leido: false
    }
    try {
      if (supabase) {
        const { error } = await supabase.from('mensajes').insert([entry])
        if (!error) {
          alert('Registro solicitado ✅ (te contactaremos)')
          return
        }
      }
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Registro Evento', email: '', mensaje: `Interés en evento: ${evento?.titulo ?? ''}` })
      })
      if (res.ok) {
        alert('Registro solicitado ✅ (te contactaremos)')
      } else {
        alert('No se pudo registrar')
      }
    } catch (err) {
      console.error(err)
      alert('Error al registrar')
    }
  }

  const renderHeader = () => (
    <header className="bg-background/95 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AIPMA</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Alianza Internacional de Periodismo</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                onClick={() => setActiveSection(item.id)}
                className="text-sm"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Abrir/cerrar menú"
          >
            {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  onClick={() => {
                    setActiveSection(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className="justify-start"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )

  const renderInicio = () => (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=75)'
          }}
          aria-hidden
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Conectando el Periodismo
            <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              y los Medios en el Mundo
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La Alianza Internacional de Periodismo y Medios Audiovisuales representa la pluralidad,
            ética y credibilidad de la voz global del periodismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setActiveSection('nosotros')} className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
              Conoce Más Sobre Nosotros
            </Button>
            <Button size="lg" variant="outline" onClick={() => setActiveSection('miembros')} className="border-primary text-primary hover:bg-primary hover:text-white transition-all">
              Únete a AIPMA
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Nuestros Pilares</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AIPMA se fundamenta en principios sólidos que guían nuestra misión global
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="bg-primary/10 text-primary p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8" />
              </div>
              <CardTitle>Alcance Global</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conectamos periodistas y medios de comunicación de todos los continentes,
                promoviendo el intercambio de experiencias y mejores prácticas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-primary/10 text-primary p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <NewspaperIcon className="h-8 w-8" />
              </div>
              <CardTitle>Ética Periodística</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Defendemos los más altos estándares éticos en el periodismo,
                promoviendo la verdad, independencia y responsabilidad social.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-primary/10 text-primary p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8" />
              </div>
              <CardTitle>Comunidad Profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Fomentamos una red sólida de profesionales comprometidos con la excelencia
                en el periodismo y los medios audiovisuales.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent News Preview */}
      <section className="bg-primary/5 py-16 border-t border-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Últimas Noticias</h2>
            <p className="text-muted-foreground">Mantente al día con las novedades del mundo del periodismo</p>
          </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.slice(0, 3).map((noticia) => (
              <Card key={noticia.id} className="hover:shadow-lg transition-shadow border-primary/20 hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{noticia.categoria}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {noticia.fecha ? fmtShort.format(new Date(noticia.fecha)) : ''}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-primary">{noticia.titulo}</CardTitle>
                  <CardDescription>{noticia.resumen}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button onClick={() => setActiveSection('noticias')} className="bg-primary hover:bg-primary/90 text-white">Ver Todas las Noticias</Button>
          </div>
        </div>
      </section>
    </div>
  )

  const renderNosotros = () => (
    <div className="space-y-16 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-6">Quiénes Somos</h1>
            <p className="text-xl text-muted-foreground">
              La voz global del periodismo profesional y ético
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Nuestra Historia</h2>
              <p className="text-muted-foreground mb-4">
                AIPMA nació de la necesidad de crear una red internacional que conectara
                a los profesionales del periodismo y medios audiovisuales, promoviendo
                estándares éticos y la excelencia profesional a nivel global.
              </p>
              <p className="text-muted-foreground">
                Desde nuestros inicios, hemos trabajado incansablemente para defender
                la libertad de prensa, la independencia editorial y el derecho a la información.
              </p>
            </div>
            <div
              className="bg-cover bg-center rounded-lg h-64"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1623039405147-547794f92e9e?auto=format&fit=crop&w=1200&q=75)'
              }}
              aria-label="Periodistas en sala de redacción"
            />
          </div>

          <div className="bg-card p-8 rounded-lg border border-border mb-16">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Nuestra Misión</h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
              Fortalecer el periodismo global mediante la promoción de la ética profesional,
              el intercambio de conocimientos y la defensa de la libertad de expresión,
              conectando a periodistas y medios audiovisuales de todo el mundo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Nuestros Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {['Ética y Transparencia','Independencia Editorial','Veracidad y Precisión','Responsabilidad Social','Diversidad y Pluralidad'].map(v => (
                    <li key={v} className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nuestro Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">Países Representados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Miembros Activos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">100+</div>
                    <div className="text-sm text-muted-foreground">Eventos Anuales</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNoticias = () => (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Noticias y Publicaciones</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mantente informado sobre las últimas novedades del mundo del periodismo y medios audiovisuales
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando noticias...</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {noticias.length > 0 ? (
              noticias.map((noticia) => (
                <Card key={noticia.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">{noticia.categoria}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {noticia.fecha ? fmtLong.format(new Date(noticia.fecha)) : ''}
                      </span>
                    </div>
                    <CardTitle className="text-2xl">{noticia.titulo}</CardTitle>
                    <CardDescription className="text-base">{noticia.resumen}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{noticia.contenido}</p>
                    {noticia.autor && (
                      <p className="text-sm text-muted-foreground">
                        Por: <span className="font-medium">{noticia.autor}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <NewspaperIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay noticias disponibles en este momento.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderEventos = () => (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Eventos y Conferencias</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Únete a nuestros eventos internacionales, seminarios y talleres para profesionales del periodismo
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando eventos...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {eventos.length > 0 ? (
              eventos.map((evento) => (
                <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={evento.tipo === 'conferencia' ? 'default' : 'secondary'}>
                        {evento.tipo}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{evento.ubicacion}</span>
                    </div>
                    <CardTitle className="text-xl">{evento.titulo}</CardTitle>
                    <CardDescription>
                      <CalendarIcon className="h-4 w-4 inline mr-2" />
                      {evento.fecha ? fmtLong.format(new Date(evento.fecha)) : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{evento.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {evento.capacidad} participantes máx.
                      </span>
                      <Button size="sm" onClick={() => handleEventRegister(evento)}>Registrarse</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay eventos programados en este momento.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderMiembros = () => (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Miembros y Alianzas</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Únete a nuestra comunidad global de periodistas y profesionales de medios audiovisuales
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Beneficios de ser Miembro</CardTitle>
                <CardDescription>
                  Descubre todas las ventajas de formar parte de AIPMA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {[
                      'Acceso a recursos exclusivos y bases de datos especializadas',
                      'Participación en eventos internacionales con descuentos especiales',
                      'Red global de contactos profesionales'
                    ].map((t) => (
                      <div key={t} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      'Certificaciones y programas de formación continua',
                      'Oportunidades de colaboración internacional',
                      'Soporte legal y ético en temas profesionales'
                    ].map((t) => (
                      <div key={t} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {/* Botón existente + toggle formulario */}
                  <Button className="w-full" onClick={() => setShowMemberForm(v => !v)}>
                    {showMemberForm ? 'Ocultar formulario' : 'Solicitar Membresía'}
                  </Button>

                  {showMemberForm && (
                    <form onSubmit={handleCreateMember} className="grid gap-3 border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input placeholder="Nombre completo" required
                          value={formMember.nombre}
                          onChange={(e)=>setFormMember(s=>({...s,nombre:e.target.value}))}/>
                        <Input placeholder="Organización"
                          value={formMember.organizacion}
                          onChange={(e)=>setFormMember(s=>({...s,organizacion:e.target.value}))}/>
                        <Input placeholder="Especialidad"
                          value={formMember.especialidad}
                          onChange={(e)=>setFormMember(s=>({...s,especialidad:e.target.value}))}/>
                        <Input placeholder="País"
                          value={formMember.pais}
                          onChange={(e)=>setFormMember(s=>({...s,pais:e.target.value}))}/>
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={formMember.tipo}
                          onChange={(e)=>setFormMember(s=>({...s,tipo:e.target.value}))}
                        >
                          <option value="periodista">Periodista</option>
                          <option value="productor">Productor</option>
                          <option value="editor">Editor</option>
                          <option value="director">Director</option>
                        </select>
                        <Input type="date" placeholder="Fecha de ingreso"
                          value={formMember.fechaIngreso}
                          onChange={(e)=>setFormMember(s=>({...s,fechaIngreso:e.target.value}))}/>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={()=>setShowMemberForm(false)}>Cancelar</Button>
                        <Button type="submit">Enviar solicitud</Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{miembros.length}</div>
                    <div className="text-sm text-muted-foreground">Miembros Activos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">Países</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">25+</div>
                    <div className="text-sm text-muted-foreground">Organizaciones Aliadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Directorio de Miembros</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando miembros...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {miembros.length > 0 ? (
                miembros.map((miembro) => (
                  <Card key={miembro.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{miembro.nombre}</CardTitle>
                        <Badge variant="outline">{miembro.tipo}</Badge>
                      </div>
                      <CardDescription>
                        {miembro.especialidad} • {miembro.pais}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{miembro.organizacion}</p>
                      <p className="text-sm text-muted-foreground">
                        Miembro desde: {miembro.fechaIngreso ? new Date(miembro.fechaIngreso).getFullYear() : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="text-center py-12">
                      <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">El directorio se está actualizando.</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderContacto = () => (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contacto</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estamos aquí para apoyarte. Contáctanos para cualquier consulta o para unirte a nuestra comunidad
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un Mensaje</CardTitle>
                <CardDescription>
                  Completa el formulario y nos pondremos en contacto contigo pronto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Nombre Completo
                    </label>
                    <Input
                      name="nombre"
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Correo Electrónico
                    </label>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Mensaje
                    </label>
                    <Textarea
                      name="mensaje"
                      required
                      rows={5}
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MailIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Correo Electrónico</p>
                    <p className="text-muted-foreground">contacto@aipma.org</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Sitio Web</p>
                    <p className="text-muted-foreground">www.aipma.org</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <UsersIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Redes Sociales</p>
                    <p className="text-muted-foreground">@AIPMA_Oficial</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Únete a Nuestro Newsletter</CardTitle>
                <CardDescription>
                  Recibe las últimas noticias y actualizaciones del mundo del periodismo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex space-x-2" onSubmit={handleNewsletterSubmit}>
                  <Input
                    placeholder="tu@email.com"
                    className="flex-1"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e)=>setNewsletterEmail(e.target.value)}
                    required
                  />
                  <Button type="submit">Suscribirse</Button>
                </form>
              </CardContent>
            </Card>

            <div
              className="bg-cover bg-center rounded-lg h-48"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=1200&q=75)'
              }}
              aria-label="Medios audiovisuales"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'nosotros':
        return renderNosotros()
      case 'noticias':
        return renderNoticias()
      case 'eventos':
        return renderEventos()
      case 'miembros':
        return renderMiembros()
      case 'contacto':
        return renderContacto()
      default:
        return renderInicio()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderHeader()}
      <main>
        {renderContent()}
      </main>
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">AIPMA</h3>
                <p className="text-xs text-muted-foreground">Alianza Internacional de Periodismo y Medios Audiovisuales</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 AIPMA. Conectando el periodismo y los medios en el mundo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AIPMAWebsite
