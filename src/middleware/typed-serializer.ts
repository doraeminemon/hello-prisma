import { Prisma, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { pick } from 'lodash-es';

const brandExtension = Prisma.defineExtension((client) => {
  type ModelKey = Exclude<keyof typeof client, `$${string}` | symbol>;
  type Result = {
    [K in ModelKey]: {
      __typename: { needs: Record<string, never>; compute: () => K };
    };
  };

  const result = {} as Result;
  const modelKeys = Object.keys(client).filter(
    (key) => !key.startsWith('$'),
  ) as ModelKey[];
  modelKeys.forEach((k) => {
    result[k] = { __typename: { needs: {}, compute: () => k as any } };
  });

  return client.$extends({ result });
});

const client = new PrismaClient().$extends({
  query: {
    $allModels: {
      async findFirst<T, A>(
        this: T,
        { model, args, query },
      ): Promise<Prisma.UserGetPayload<A> & { __type: string }> {
        const result = await query({
          ...args,
        });
        const includeModels = Object.keys(args.include);
        if (includeModels.length > 0) {
          for (const i of includeModels) {
            const val = result[i];
            if (Array.isArray(val)) {
              result[i] = val.map((v) => ({ ...v, __type: i }));
            } else {
              result[i] = { ...val, __type: i };
            }
          }
        }
        return {
          ...result,
          __type: model,
        };
      },
      async findMany({ model, args, query }) {
        const result = await query({
          ...args,
        });
        return result.map((r) => ({
          ...r,
          __type: model,
        }));
      },
    },
  },
});

type ModelName = Prisma.ModelName;

type ModelPayload<M extends ModelName> =
  Prisma.TypeMap['model'][M]['payload']['scalars'] & { __type: M };

type AnyModelPayload<T extends ModelName> = ModelPayload<T>;

type AnyModelWithRelationPayload<T extends ModelName> = AnyModelPayload<T> & {
  [key: string]: AnyModelWithRelationPayload<T>;
};

type NestedModelPayload =
  | ModelPayload<ModelName>
  | (ModelPayload<ModelName> & {
      [key: string]: NestedModelPayload;
    })
  | NestedModelPayload[];

type AnyPayload = NestedModelPayload | NestedModelPayload[];

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

// Transformer type with constraints
interface Transformer<
  TInput extends AnyModelPayload<any>,
  TOutput extends JsonValue,
> {
  (input: TInput): TOutput;
}

// Example Prisma-generated type for model names
// TransformerMap with constraints
type TransformerMap = {
  [K in ModelName]: Transformer<
    AnyModelPayload<any>, // Input type includes __type and model payload
    JsonValue
  >;
};

type SerializeInputArgs<T extends ModelName> = Parameters<TransformerMap[T]>[0];

type UserInput = SerializeInputArgs<'User'>;

const commentSchema = z
  .strictObject({
    // id: z.number(),
    content: z.string(),
  })
  .strip();

const resultUserSchema = z
  .strictObject({
    id: z.number(),
    name: z.string(),
    createdAt: z.date().transform((t) => t.toISOString()),
    Comment: commentSchema.array().optional(),
  })
  .strip();

type ResultUser = z.infer<typeof resultUserSchema>;

type ResultUserRecord = Record<keyof ResultUser, unknown>;

const fields = Object.keys(
  resultUserSchema.shape,
) as (keyof typeof resultUserSchema.shape)[];

type ResultComment = {
  id: number;
  content: string;
};

const UserSerializer = (user: ModelPayload<'User'>): ResultUser => {
  return resultUserSchema.parse(user);
};

// type A = ReturnType<typeof UserSerializer> extends ResultUserRecord;

const CommentSerializer = (
  comment: ModelPayload<'Comment'>,
): ResultComment => ({
  id: comment.id,
  content: comment.content,
});

const registry: TransformerMap = {
  User: UserSerializer,
  Comment: CommentSerializer,
};

const serialize = (input: NestedModelPayload) => {
  if (Array.isArray(input)) {
    return input.map((i) => serialize(i));
  }

  const transformer = registry[input.__type];
  if (!transformer) {
    throw new Error(`No serializer registered for type: ${input.__type}`);
  }

  const transformed = transformer(input);

  const clientDelegate =
    client[input.__type.toLowerCase() as Lowercase<ModelName>];
  const fieldsObj = clientDelegate.fields as (typeof clientDelegate)['fields'];
  const fieldKeys = Object.keys(fieldsObj);

  for (const k in input) {
    if (k === '__type') {
      continue;
    }
    const isExtraField = !fieldKeys.includes(k);
    if (!isExtraField) {
      continue;
    }
    const value = input[k];
    transformed[k] = serialize(value);
  }

  return transformed;
};

const serializePrimitive = (input: any): JsonValue => {
  if (input instanceof Date) {
    return input.toISOString();
  }
  if (
    ['string', 'number', 'boolean'].includes(typeof input) ||
    input === null
  ) {
    return input;
  }
  throw new Error(`Unsupported primitive type: ${typeof input}`);
};

const user: ModelPayload<'User'> = {
  id: 1,
  name: 'asd',
  createdAt: new Date(),
  __type: 'User',
  email: 'asd@gmail.com',
};

const users: ModelPayload<'User'>[] = [
  {
    id: 1,
    name: 'asd',
    createdAt: new Date(),
    __type: 'User',
    email: 'asd@gmail.com',
  },
  {
    id: 1,
    name: 'asd',
    createdAt: new Date(),
    __type: 'User',
    email: 'asd@gmail.com',
  },
];

const userWithRelation: Prisma.UserGetPayload<{ include: { Comment: true } }> =
  {
    // __type: 'User',
    id: 1,
    createdAt: new Date(),
    email: 'asd@gmail.com',
    name: 'some',
    Comment: [
      {
        // __type: 'Comment',
        id: 1,
        content: 'asd',
        userId: 1,
      },
    ],
  };

const result = serialize(user);
const results = serialize(users);
// const resultWRelation = serialize(userWithRelation);

console.log({ result, results });
// console.log({ resultWRelation, c: resultWRelation.comments });

const query = async () => {
  await client.$connect();
  const user = await client.user.findFirst({
    where: { id: 1 },
    include: { Comment: true },
  });
  const u = user as typeof user & { __type: 'User' };
  const serializedUser = serialize(u);
  console.log({ serializedUser, c: serializedUser.Comment });
  const parsedUser = resultUserSchema.parse(u);
  console.log({ parsedUser, c: parsedUser.Comment });
};

await query();
