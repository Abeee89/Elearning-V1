"use server";
import { db } from "@/db";
import { classes, classEnrollments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "./auth";

export async function createClass(formData: FormData) {
  try {
    const user = await requireRole(["teacher"]);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) return { error: "Nama kelas wajib diisi" };

    const newClass = await db.insert(classes).values({
      name,
      description,
      teacherId: user.id,
    }).returning();

    return { success: true, classId: newClass[0].id };
  } catch (e: any) {
    return { error: e.message || "Gagal membuat kelas" };
  }
}

export async function enrollStudent(formData: FormData) {
  try {
    const user = await requireRole(["student"]);
    const classId = formData.get("classId") as string;

    if (!classId) return { error: "ID Kelas wajib diisi" };

    await db.insert(classEnrollments).values({
      classId,
      studentId: user.id,
    });

    return { success: true, classId };
  } catch (e: any) {
    if (e.code === '23505') {
       return { error: "Anda sudah terdaftar di kelas ini" };
    }
    return { error: "Kelas tidak ditemukan atau ID kelas tidak valid" };
  }
}

export async function getTeacherClasses() {
  const user = await requireRole(["teacher"]);
  return db.select().from(classes).where(eq(classes.teacherId, user.id));
}

export async function getStudentClasses() {
  const user = await requireRole(["student"]);
  
  const enrolled = await db.select({
    id: classes.id,
    name: classes.name,
    description: classes.description,
    teacherId: classes.teacherId,
    enrolledAt: classEnrollments.enrolledAt,
  })
  .from(classEnrollments)
  .innerJoin(classes, eq(classEnrollments.classId, classes.id))
  .where(eq(classEnrollments.studentId, user.id));

  return enrolled;
}

export async function getClassById(classId: string) {
  const result = await db.select().from(classes).where(eq(classes.id, classId));
  return result[0];
}
