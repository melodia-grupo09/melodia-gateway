import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto', () => {
  let dto: UpdateProfileDto;

  beforeEach(() => {
    dto = new UpdateProfileDto();
  });

  it('should be valid with valid string fields', async () => {
    dto.nombre = 'Juan';
    dto.apellido = 'Pérez';
    dto.nombre_completo = 'Juan Carlos Pérez';
    dto.email = 'juan.perez@email.com';
    dto.telefono = '+54911234567';
    dto.direccion = 'Av. Corrientes 1234';
    dto.biografia = 'Músico profesional...';
    dto.filtro_contenido = true;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should be valid with empty DTO (all optional fields)', async () => {
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should be valid with only some fields filled', async () => {
    dto.nombre = 'Juan';
    dto.email = 'juan@email.com';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should be valid with nombre_completo field', async () => {
    dto.nombre_completo = 'Juan Carlos Pérez González';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.nombre_completo).toBe('Juan Carlos Pérez González');
  });

  it('should fail validation when nombre is not a string', async () => {
    (dto as any).nombre = 123;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('should fail validation when apellido is not a string', async () => {
    (dto as any).apellido = 123;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('should fail validation when nombre_completo is not a string', async () => {
    (dto as any).nombre_completo = 123;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('should fail validation when email is not a valid email', async () => {
    dto.email = 'invalid-email';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });

  it('should fail validation when fecha_nacimiento is not a string', async () => {
    (dto as any).telefono = 123;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('should fail validation when email is not valid', async () => {
    dto.email = 'invalid-email';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });

  it('should fail validation when filtro_contenido is not a boolean', async () => {
    (dto as any).filtro_contenido = 'true';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isBoolean).toBeDefined();
  });

  it('should be valid when all optional fields are undefined', async () => {
    dto.nombre = undefined;
    dto.apellido = undefined;
    dto.nombre_completo = undefined;
    dto.email = undefined;
    dto.telefono = undefined;
    dto.direccion = undefined;
    dto.biografia = undefined;
    dto.filtro_contenido = undefined;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should handle long nombre_completo', async () => {
    dto.nombre_completo = 'Juan Carlos Pérez González de la Cruz y Martínez';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.nombre_completo).toBe(
      'Juan Carlos Pérez González de la Cruz y Martínez',
    );
  });

  it('should handle special characters in nombre_completo', async () => {
    dto.nombre_completo = 'María José Ñuñez-Rodríguez';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.nombre_completo).toBe('María José Ñuñez-Rodríguez');
  });
});
