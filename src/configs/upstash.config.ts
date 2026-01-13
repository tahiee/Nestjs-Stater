import { Index } from "@upstash/vector";
import { env } from "@/utils/env";

type MetaPrimitives = string | number | boolean;

export type MetaData = Record<string, MetaPrimitives | MetaPrimitives[]>;

type IndexType<Meta extends MetaData = MetaData> = InstanceType<
  typeof Index<Meta>
>;

export type Meta = MetaData;

export type UpsertParameters<Meta extends MetaData = MetaData> = Parameters<
  IndexType<Meta>["upsert"]
>;

export const vector = new Index({
  token: env.UPSTASH_VECTOR_REST_TOKEN,
  url: env.UPSTASH_VECTOR_REST_URL,
});
