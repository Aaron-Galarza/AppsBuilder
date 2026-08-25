'use client';

import { AdminCard, AdminInput, cn } from '@saas/ui';
import { useAdminConfig } from '@saas/hooks';
import { DaySchedule, RainConfig, Schedule } from '@saas/types';
import { Clock, CloudRain, Image as ImageIcon, Power, Route } from 'lucide-react';
import { useState } from 'react';

export interface ConfigTabProps {
  primaryColor?: string;
}

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

/** Configuración del negocio: pánico, horarios, banner, lluvia y rangos de envío */
export function ConfigTab({ primaryColor = '#111' }: ConfigTabProps) {
  const {
    config,
    loading,
    error,
    updateSchedule,
    updateBanner,
    updateRain,
    addDeliveryRange,
    removeDeliveryRange,
    toggleEmergency,
  } = useAdminConfig();

  if (loading && !config) return <p className="text-xs text-neutral-500">Cargando config...</p>;
  if (error) return <p className="text-xs font-medium text-red-400">{error}</p>;
  if (!config) return null;

  const sortedDays = [...config.schedule.days].sort(
    (a, b) => DAY_ORDER.indexOf(a.day as never) - DAY_ORDER.indexOf(b.day as never)
  );

  const setDay = (next: DaySchedule) => {
    const days = config.schedule.days.map((d) => (d.day === next.day ? next : d));
    void updateSchedule({ ...config.schedule, days });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Pánico */}
      <AdminCard variant="default" className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              config.emergencyClosed
                ? 'bg-red-500/15 text-red-500'
                : 'bg-green-500/15 text-green-500'
            )}
          >
            <Power size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Botón pánico</p>
            <p className="text-[11px] text-neutral-500">
              {config.emergencyClosed
                ? 'La tienda está CERRADA por emergencia'
                : 'Tienda operando normalmente'}
            </p>
          </div>
        </div>

        <button
          onClick={() => void toggleEmergency()}
          className={cn(
            'rounded-full px-4 py-2 text-xs font-bold text-white transition active:scale-95',
            config.emergencyClosed ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
          )}
        >
          {config.emergencyClosed ? 'Reabrir' : 'Cerrar ya'}
        </button>
      </AdminCard>

      {/* Horarios */}
      <AdminCard variant="default" className="flex flex-col gap-3 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Clock size={15} style={{ color: primaryColor }} />
          Horarios de atención
        </h3>

        {sortedDays.map((day) => (
          <div key={day.day} className={cn('flex items-center gap-2', day.closed && 'opacity-50')}>
            <label className="flex w-24 shrink-0 items-center gap-2 text-xs font-semibold text-white">
              <input
                type="checkbox"
                checked={!day.closed}
                onChange={(e) => setDay({ ...day, closed: !e.target.checked })}
                className="accent-white"
                aria-label={`Abre ${DAY_LABELS[day.day] ?? day.day}`}
              />
              {DAY_LABELS[day.day] ?? day.day}
            </label>

            <input
              type="time"
              value={day.openTime}
              disabled={day.closed}
              onChange={(e) => setDay({ ...day, openTime: e.target.value })}
              className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white disabled:opacity-40"
              aria-label={`Apertura ${DAY_LABELS[day.day]}`}
            />
            <span className="text-xs text-neutral-600">–</span>
            <input
              type="time"
              value={day.closeTime}
              disabled={day.closed}
              onChange={(e) => setDay({ ...day, closeTime: e.target.value })}
              className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white disabled:opacity-40"
              aria-label={`Cierre ${DAY_LABELS[day.day]}`}
            />
          </div>
        ))}
      </AdminCard>

      {/* Banner */}
      <AdminCard variant="default" className="flex flex-col gap-3 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <ImageIcon size={15} className="text-blue-400" />
          Banner promocional
        </h3>

        {config.bannerUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={config.bannerUrl}
            alt="Banner actual"
            className="max-h-32 w-full rounded-lg object-cover"
          />
        )}

        <UrlSaveInput initial="" cta="Actualizar" placeholder="Pegá la nueva URL..." onSave={(url) => void updateBanner(url)} />
      </AdminCard>

      {/* Lluvia */}
      <AdminCard variant="default" className="flex flex-col gap-3 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <CloudRain size={15} className="text-sky-400" />
          Recargo por lluvia
        </h3>

        <div className="flex items-end gap-2">
          <NumberSaveInput
            label="Extra en $"
            initialValue={String(config.rain.extraCost)}
            onSave={(n) => void updateRain({ enabled: true, extraCost: n } satisfies RainConfig)}
          />
          <button
            onClick={() =>
              void updateRain({
                enabled: !config.rain.enabled,
                extraCost: config.rain.extraCost,
              })
            }
            className={cn(
              'shrink-0 rounded-full px-4 py-2.5 text-xs font-bold text-white transition active:scale-95',
              config.rain.enabled ? 'bg-sky-600 hover:bg-sky-500' : 'bg-neutral-700 hover:bg-neutral-600'
            )}
          >
            {config.rain.enabled ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </AdminCard>

      {/* Rangos de envío */}
      <AdminCard variant="default" className="flex flex-col gap-3 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Route size={15} className="text-violet-400" />
          Rangos de envío
        </h3>

        <ul className="flex flex-col gap-1.5">
          {(config.deliveryRanges ?? []).map((range) => (
            <li
              key={range._id}
              className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2"
            >
              <span className="text-xs text-white">
                {range.minKm}–{range.maxKm} km · <strong>${range.cost}</strong>
              </span>
              <button
                onClick={() => void removeDeliveryRange(range._id)}
                className="text-[11px] font-semibold text-red-400 hover:text-red-300"
              >
                Quitar
              </button>
            </li>
          ))}
          {(config.deliveryRanges ?? []).length === 0 && (
            <li className="py-2 text-center text-xs text-neutral-500">Sin rangos configurados.</li>
          )}
        </ul>

        <RangeAdder onAdd={(maxKm, cost) => void addDeliveryRange({ minKm: 0, maxKm, cost })} />
      </AdminCard>
    </div>
  );
}

/* --------------------------- Inputs helpers --------------------------- */

function UrlSaveInput({
  initial,
  onSave,
  placeholder,
  cta,
}: {
  initial: string;
  onSave: (value: string) => void;
  placeholder?: string;
  cta: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-neutral-600"
      />
      <button
        onClick={() => value.trim() && onSave(value.trim())}
        className="shrink-0 rounded-md bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
      >
        {cta}
      </button>
    </div>
  );
}

function NumberSaveInput({
  label,
  initialValue,
  onSave,
}: {
  label: string;
  initialValue: string;
  onSave: (n: number) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="flex w-full items-end gap-2">
      <div className="w-full">
        <AdminInput
          label={label}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <button
        onClick={() => onSave(Number(value))}
        className="shrink-0 rounded-md bg-white/10 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/20"
      >
        Guardar
      </button>
    </div>
  );
}

function RangeAdder({ onAdd }: { onAdd: (maxKm: number, cost: number) => void }) {
  const [km, setKm] = useState('');
  const [cost, setCost] = useState('');

  return (
    <div className="flex items-end gap-2">
      <div className="w-full">
        <AdminInput
          label="Hasta km"
          type="number"
          value={km}
          onChange={(e) => setKm(e.target.value)}
        />
      </div>
      <div className="w-full">
        <AdminInput
          label="Costo $"
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
      </div>
      <button
        onClick={() => {
          if (!km || !cost) return;
          onAdd(Number(km), Number(cost));
          setKm('');
          setCost('');
        }}
        className="shrink-0 rounded-md bg-white/10 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/20"
      >
        Agregar
      </button>
    </div>
  );
}
