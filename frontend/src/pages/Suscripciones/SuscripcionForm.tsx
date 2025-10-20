import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSuscripcion, usePlanesLite } from './useSuscripciones';

const schema = z.object({
  clienteId: z
    .number({ required_error: 'Ingresa el ID del cliente' })
    .int()
    .positive('Cliente inválido'),
  planId: z
    .number({ required_error: 'Selecciona un plan' })
    .int()
    .positive('Plan inválido'),
  fechaInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
});
type FormData = z.infer<typeof schema>;

export default function SuscripcionForm() {
  const { data: planes, isLoading: planesLoading } = usePlanesLite();
  const create = useCreateSuscripcion();

  const { register, handleSubmit, formState:{errors}, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      // por comodidad, si ya hay planes, preseleccionar el primero:
      // clienteId: 1,                   // ponlo si te sirve
      // planId: planes?.[0]?.id ?? undefined,
      fechaInicio: new Date().toISOString().slice(0,10),
    },
  });

  const onSubmit = handleSubmit(async (form) => {
    // buscamos la vigencia del plan para calcular fechaVencimiento
    const plan = planes?.find(p => p.id === form.planId);
    const dias = plan?.vigenciaDias ?? 30;
    const start = new Date(form.fechaInicio + 'T00:00:00');
    const venc = new Date(start);
    venc.setDate(start.getDate() + dias);
    const fechaVencimiento = venc.toISOString().slice(0,10);

    await create.mutateAsync({ ...form, fechaVencimiento });
    reset();
    alert('Suscripción creada');
  });

  const selectedPlanId = watch('planId');
  const selectedPlan = planes?.find(p => p.id === selectedPlanId);

  return (
    <form onSubmit={onSubmit} style={{ display:'grid', gap:8, maxWidth:520, marginBottom:16 }}>
      <h2>Nueva suscripción</h2>

      <label>Cliente ID
        <input
          type="number"
          {...register('clienteId', { valueAsNumber: true })} // 👈 convierte a number
        />
        {errors.clienteId && <small style={{color:'crimson'}}>{errors.clienteId.message}</small>}
      </label>

      <label>Plan
        <select
          defaultValue=""
          {...register('planId', { valueAsNumber: true })}   // 👈 convierte a number
          disabled={planesLoading || !planes?.length}
        >
          <option value="" disabled>-- seleccionar --</option>
          {planes?.map(p => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.vigenciaDias} días)</option>
          ))}
        </select>
        {errors.planId && <small style={{color:'crimson'}}>{errors.planId.message}</small>}
      </label>

      {selectedPlan && (
        <div style={{ fontSize: 12, color: '#555' }}>
          Vigencia del plan seleccionado: {selectedPlan.vigenciaDias} días
        </div>
      )}

      <label>Fecha inicio
        <input type="date" {...register('fechaInicio')} />
        {errors.fechaInicio && <small style={{color:'crimson'}}>{errors.fechaInicio.message}</small>}
      </label>

      <button type="submit" disabled={create.isPending || planesLoading || !planes?.length}>
        {create.isPending ? 'Guardando...' : 'Crear'}
      </button>
    </form>
  );
}
