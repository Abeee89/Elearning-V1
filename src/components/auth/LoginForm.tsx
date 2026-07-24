"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await loginUser(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        router.push("/dashboard");
      }
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-space-grotesk text-center text-text-primary">Masuk ke Platform</CardTitle>
        <CardDescription className="text-center text-text-secondary">Silakan masuk menggunakan akun Anda</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-100 p-3 rounded-md font-jetbrains-mono">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="email@contoh.com" required className="border-border-muted focus-visible:ring-trace-teal" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required className="border-border-muted focus-visible:ring-trace-teal" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-trace-teal hover:bg-teal-600 text-white" disabled={isPending}>
            {isPending ? "Memproses..." : "Masuk"}
          </Button>
          <p className="text-sm text-center text-text-secondary">
            Belum punya akun? <Link href="/register" className="text-trace-teal font-semibold hover:underline">Daftar</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
