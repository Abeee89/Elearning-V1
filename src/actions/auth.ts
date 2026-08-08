"use server";

import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signIn, auth, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}

export async function registerUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;

    if (!email || !password || !fullName || !role) {
      return { error: "Semua kolom wajib diisi" };
    }
    if (role !== "student" && role !== "teacher") {
      return { error: "Peran tidak valid" };
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return { error: "Email sudah terdaftar" };
    }

    const passwordHash = await hash(password, 10);
    
    await db.insert(users).values({
      email,
      passwordHash,
      fullName,
      role,
    });

    return { success: true };
  } catch (err) {
    return { error: "Terjadi kesalahan saat mendaftar" };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah." };
        default:
          return { error: "Terjadi kesalahan sistem." };
      }
    }
    throw error;
  }
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}
