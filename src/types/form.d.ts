import type { ZodSchema, z } from 'zod'
import type { ObjectSchema as YupSchema } from 'yup'
import type { GenericSchema as ValibotSchema } from 'valibot'
import type { Schema as JoiSchema } from 'joi'
import type { Struct as SuperstructSchema } from 'superstruct'
import type { StandardSchemaV1 } from '@standard-schema/spec'
export type InferSchemaType<S> = S extends undefined
  ? Record<string, unknown>
  : S extends ZodSchema
    ? z.infer<S>
    : S extends YupSchema<infer U>
      ? U
      : S extends ValibotSchema<infer U>
        ? U
        : S extends JoiSchema<infer U>
          ? U
          : S extends SuperstructSchema<infer U, unknown>
            ? U
            : S extends StandardSchemaV1<infer U>
              ? U
              : never
