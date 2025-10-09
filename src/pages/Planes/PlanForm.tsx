import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePlan } from './usePlanes';

const schema = z.object({
  nombre: z.string().min(2),
  precio: z.coerce.number().positive(),
  vigenciaDias: z.coerce.number().int().positive(),
});
type FormData = z.infer<typeof schema>;

export default function PlanForm() {
  const { register, handleSubmit, reset, formState:{errors} } = useForm<FormData>({ resolver: zodResolver(schema) });
  const create = useCreatePlan();

  const onSubmit = handleSubmit(async (data) => {
    await create.mutateAsync(data);
    reset();
    alert('Plan creado');
  });

  return (
    <form onSubmit={onSubmit} style={{ display:'grid', gap:8, maxWidth:420, marginBottom:16 }}>
      <h2>Nuevo plan</h2>
      <label>Nombre
        <input {...register('nombre')} />
        {errors.nombre && <small style={{color:'crimson'}}>{errors.nombre.message}</small>}
      </label>
      <label>Precio
        <input type="number" {...register('precio')} />
        {errors.precio && <small style={{color:'crimson'}}>{errors.precio.message}</small>}
      </label>
      <label>Vigencia (días)
        <input type="number" {...register('vigenciaDias')} />
        {errors.vigenciaDias && <small style={{color:'crimson'}}>{errors.vigenciaDias.message}</small>}
      </label>
      <button type="submit" disabled={create.isPending}>{create.isPending ? 'Guardando...' : 'Crear'}</button>
    </form>
  );
}
