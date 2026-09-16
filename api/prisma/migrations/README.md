# Migraciones — notas manuales

Prisma no soporta de forma nativa la restricción `EXCLUDE` de PostgreSQL ni las restricciones `CHECK`. Este directorio contendrá las migraciones generadas por `npx prisma migrate dev`; además de esas migraciones automáticas, es necesario agregar **manualmente** lo siguiente en una migración SQL (editando el archivo `migration.sql` generado, o creando una migración vacía con `npx prisma migrate dev --create-only`):

## 1. Restricción de no superposición de citas (RN-02)

Requiere la extensión `btree_gist`:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE citas ADD CONSTRAINT sin_superposicion
  EXCLUDE USING gist (
    tsrange(inicia_en, termina_en) WITH &&
  ) WHERE (estado <> 'cancelada');
```

## 2. Restricciones CHECK del modelo de datos (sección 4 de ARQUITECTURA.md)

```sql
ALTER TABLE servicios ADD CONSTRAINT duracion_minutos_positiva CHECK (duracion_minutos > 0);
ALTER TABLE servicios ADD CONSTRAINT precio_no_negativo CHECK (precio >= 0);
ALTER TABLE horarios_atencion ADD CONSTRAINT dia_semana_valido CHECK (dia_semana BETWEEN 0 AND 6);
```

> Estado: pendiente de implementar. Se agregará cuando se genere la primera migración real contra una base de datos PostgreSQL disponible.
