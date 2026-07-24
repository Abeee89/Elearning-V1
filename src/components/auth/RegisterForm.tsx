"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerUser, loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("student");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    formData.set("role", role);
    startTransition(async () => {
      const res = await registerUser(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        // Auto login
        const loginRes = await loginUser(formData);
        if (loginRes?.success) {
           router.push("/dashboard");
        } else {
           router.push("/login");
        }
      }
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-space-grotesk text-center text-text-primary">Daftar Akun Baru</CardTitle>
        <CardDescription className="text-center text-text-secondary">Buat akun untuk mulai belajar atau mengajar</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-100 p-3 rounded-md font-jetbrains-mono">{error}</div>}
          
          <div className="space-y-2">
            <Label>Peran</Label>
            <Tabs value={role} onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="student" className="data-[state=active]:bg-white data-[state=active]:text-trace-teal">Siswa</TabsTrigger>
                <TabsTrigger value="teacher" className="data-[state=active]:bg-white data-[state=active]:text-trace-teal">Guru</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input id="fullName" name="fullName" placeholder="John Doe" required className="border-border-muted focus-visible:ring-trace-teal" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="email@contoh.com" required className="border-border-muted focus-visible:ring-trace-teal" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} className="border-border-muted focus-visible:ring-trace-teal" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-trace-teal hover:bg-teal-600 text-white" disabled={isPending}>
            {isPending ? "Mendaftarkan..." : "Daftar"}
          </Button>
          <p className="text-sm text-center text-text-secondary">
            Sudah punya akun? <Link href="/login" className="text-trace-teal font-semibold hover:underline">Masuk</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
