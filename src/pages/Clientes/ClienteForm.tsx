import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCliente } from './useClientes';

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  correo: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  planId: z.coerce.number().int().positive().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ClienteForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', correo: '', telefono: '', planId: undefined }
  });
  const create = useCreateCliente();

  const onSubmit = handleSubmit(async (data) => {
    await create.mutateAsync({ ...data });
    reset();
    alert('Cliente creado');
  });

  return (
    <form onSubmit={onSubmit} style={{ display:'grid', gap:8, maxWidth:460, marginBottom:16 }}>
      <h2>Nuevo cliente</h2>
      <label>Nombre
        <input {...register('nombre')} />
        {errors.nombre && <small style={{color:'crimson'}}>{errors.nombre.message}</small>}
      </label>
      <label>Correo
        <input {...register('correo')} />
        {errors.correo && <small style={{color:'crimson'}}>{errors.correo.message}</small>}
      </label>
      <label>Teléfono
        <input {...register('telefono')} />
      </label>
      <label>Plan ID (opcional)
        <input type="number" {...register('planId')} />
      </label>
      <button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Guardando...' : 'Crear'}
      </button>
      {create.isError && <div style={{color:'crimson'}}>Error al crear</div>}
    </form>
  );
}
