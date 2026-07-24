"use server";
import { db } from "@/db";
import { simulations } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { requireRole } from "./auth";

export async function getSimulationsBySubchapter(subchapterId: string) {
  await requireRole(["student", "teacher"]);
  return db.select().from(simulations).where(eq(simulations.subchapterId, subchapterId));
}

export async function getSandboxSimulations() {
  await requireRole(["student", "teacher"]);
  // Sandbox simulations might be those without a specific subchapter or with a specific type
  return db.select().from(simulations).where(isNull(simulations.subchapterId));
}
