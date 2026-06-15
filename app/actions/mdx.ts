"use server";

import { serialize } from "next-mdx-remote/serialize";
import { mdxSerializeOptions } from "@/lib/mdx/serialize";

export async function serializeMdx(source: string) {
  return serialize(source, mdxSerializeOptions);
}
