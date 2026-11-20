# Fútbol Compañía 2.0

Base técnica de la plataforma deportiva de Fútbol Compañía. Esta etapa incluye el modelo relacional, reglas de dominio iniciales, un panel privado y datos ficticios de desarrollo; no incluye aún las pantallas públicas finales ni la administración de partidos.

## Stack

- Next.js con App Router y TypeScript
- PostgreSQL y Prisma ORM
- Zod para validaciones de dominio
- Almacenamiento de archivos preparado mediante `FileObject` para un proveedor S3 compatible futuro

## Requisitos e instalación

1. Instalar Node.js y pnpm.
2. Ejecutar `pnpm install`.
3. Copiar `.env.example` como `.env` y configurar una URL real de PostgreSQL en `DATABASE_URL`. El archivo `.env` no debe versionarse.
4. Configurar `ADMIN_PASSWORD` y un `ADMIN_SESSION_SECRET` aleatorio de al menos 32 caracteres. Ambas variables sólo se leen en el servidor.

## Base de datos

```bash
pnpm db:generate
pnpm db:migrate -- --name initial_schema
pnpm db:seed
```

La migración inicial ya está en `prisma/migrations`. Para aplicar las migraciones existentes en otro entorno se puede usar `pnpm exec prisma migrate deploy`.

## Desarrollo local

```bash
pnpm dev
```

Abrir `http://localhost:3000`.

El panel está disponible en `http://localhost:3000/admin/login`. Todas las rutas administrativas comprueban una cookie de sesión `HttpOnly` firmada; además, cada operación de escritura vuelve a validar la sesión en el servidor.

Comprobaciones disponibles:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Decisiones del modelo

- `Person` es la persona única e histórica.
- `PlayerSeason` congela nivel y estado deportivo para Apertura o Clausura; el nivel no se guarda en la persona.
- `Team` pertenece exclusivamente a una `Season`; por eso los planteles no se reciclan entre ediciones.
- `TeamMembership` representa el plantel habitual; `MatchParticipation` representa quién jugó efectivamente y para qué equipo en ese partido.
- Goles y tarjetas apuntan a `MatchParticipation`, nunca a una pertenencia habitual. Esto conserva correctamente estadísticas de reemplazantes.
- `MatchReplacement` y `MatchSubstitution` son entidades distintas: ausencia previa versus cambio durante el partido.
- No hay tabla persistida de posiciones: las posiciones, goleadores, tarjetas y valla menos vencida se derivarán de partidos y eventos oficiales.
- Las planillas usan versiones inmutables asociadas a un archivo. La tabla `AiSheetExtraction` sólo deja preparada la futura pre-carga por IA y no publica nada automáticamente.
- El panel inicial administra campeonatos, temporadas, jugadores, suplentes, equipos y planteles. Cada cambio relevante se registra en `AuditLog` con el actor único `admin`.

## Pendiente de definición deportiva

El documento no define el criterio posterior al cuarto desempate, reglas de penales/autogoles, acumulación de tarjetas o suspensiones, ni límites de sustituciones o reingresos. No fueron implementados.
