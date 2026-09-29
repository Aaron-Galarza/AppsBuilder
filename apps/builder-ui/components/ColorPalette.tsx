'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import type { BrandColors, SurfacesMap } from '../lib/preview/templateThemes'

type BrandKey = keyof BrandColors
type SurfaceKey = keyof SurfacesMap

type ColorsValue = BrandColors & { surfaces: SurfacesMap }

interface ColorPaletteProps {
  colors: ColorsValue
  onChange: (patch: Partial<ColorsValue>) => void
  /** Restaura los 8 colores (marca + superficies) a los defaults de la plantilla. */
  onResetAll: () => void
}

/**
 * Colores de marca (los 3 de identidad) con, debajo, una nota de a dónde mirar
 * para encontrar rápido su referencia. Son los que más se ven.
 */
const BRAND_INFO: Array<{ key: BrandKey; label: string; hint: string }> = [
  {
    key: 'primary',
    label: 'Color primario',
    hint: 'Los botones de acción (agregar, ir al carrito, ingresar, el del hero), los precios de los productos, el nombre del local y el ícono/contador del carrito en el header, y los íconos de contacto del footer.',
  },
  {
    key: 'secondary',
    label: 'Color secundario',
    hint: 'Botones secundarios y bordes de hover en elementos seleccionables (tipo de entrega, filtros). Uso puntual: es normal que casi no se note.',
  },
  {
    key: 'accent',
    label: 'Color accent',
    hint: 'Las etiquetas del banner de oferta, el punto activo del carrusel del hero y los títulos chicos de cada sección.',
  },
]

/**
 * Superficies neutras (fondo, texto y cajas). Controlan el "clima" del sitio:
 * el fondo general, el texto y las cajas tipo tarjeta.
 */
const SURFACE_INFO: Array<{ key: SurfaceKey; label: string; hint: string }> = [
  {
    key: 'background',
    label: 'Fondo',
    hint: 'El fondo de todas las pantallas: es lo que se ve detrás de las tarjetas y paneles.',
  },
  {
    key: 'foreground',
    label: 'Texto principal',
    hint: 'Todo el texto fuerte: títulos, nombres de productos y precios. (El texto de apoyo depende de "Texto secundario".)',
  },
  {
    key: 'card',
    label: 'Tarjeta',
    hint: 'El fondo de las "cajas": tarjetas de producto del menú, ítems del carrito, panel del checkout y tarjetas de la galería.',
  },
  {
    key: 'muted',
    label: 'Panel (muted)',
    hint: 'Fondos suaves: placeholders de imagen, chips de categoría en reposo y estados hover.',
  },
  {
    key: 'mutedForeground',
    label: 'Texto secundario',
    hint: 'Los textos de apoyo: descripciones de productos, subtítulos, placeholders y textos de ayuda de los formularios.',
  },
]

/** Colores que se derivan solos y no se editan a mano. */
const DERIVED_INFO: Array<{ label: string; hint: string }> = [
  { label: 'Texto sobre color', hint: 'El texto y los íconos dentro de botones y etiquetas rellenos. Se calcula solo (negro o blanco) para que siempre se lea bien.' },
  { label: 'Bordes', hint: 'Las líneas finas de tarjetas, campos y separadores. Se derivan del texto principal.' },
  { label: 'Anillo de foco', hint: 'El contorno al tabular por los campos de los formularios. Se deriva del color primario.' },
]

/**
 * Botón "Cambiar colores" que despliega la paleta completa del sitio: los 8
 * colores editables (3 de marca + 5 de superficie), cada uno con una nota de
 * qué afecta, más los derivados que se calculan solos.
 */
export function ColorPalette({ colors, onChange, onResetAll }: ColorPaletteProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-foreground transition hover:text-ok"
        >
          <Palette size={14} />
          <span>{open ? '▾' : '▸'}</span> Cambiar colores
        </button>
        <div className="flex items-center gap-3">
          <span>
            {[colors.primary, colors.secondary, colors.accent].map((c) => (
              <span
                key={c}
                className="mr-1 inline-block h-3 w-3 rounded-full border border-border2 align-middle"
                style={{ background: c }}
              />
            ))}
          </span>
          {open && (
            <button
              type="button"
              onClick={onResetAll}
              className="text-[11px] font-medium text-muted-foreground underline underline-offset-2 transition hover:text-foreground"
            >
              Restaurar todos los colores
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-5">
          <div>
            <div className="mb-3">
              <h3 className="lbl">Marca</h3>
              <p className="hint">Los colores que definen la identidad del local.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {BRAND_INFO.map((c) => (
                <ColorPicker
                  key={c.key}
                  label={c.label}
                  value={colors[c.key]}
                  hint={c.hint}
                  onChange={(v) => onChange({ [c.key]: v })}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3">
              <h3 className="lbl">Superficies</h3>
              <p className="hint">Fondo, textos y cajas: el clima del sitio.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {SURFACE_INFO.map((c) => (
                <ColorPicker
                  key={c.key}
                  label={c.label}
                  value={colors.surfaces[c.key]}
                  hint={c.hint}
                  onChange={(v) => onChange({ surfaces: { ...colors.surfaces, [c.key]: v } })}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border2 bg-muted/40 p-3">
            <h3 className="lbl">Se calculan solos (no se editan)</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {DERIVED_INFO.map((d) => (
                <li key={d.label} className="text-[11px] leading-relaxed text-muted-foreground">
                  <span className="font-bold text-foreground">{d.label}:</span> {d.hint}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
