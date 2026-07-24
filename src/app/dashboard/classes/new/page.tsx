"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClass } from "@/actions/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function NewClassPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createClass(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        router.push("/dashboard");
      }
    });
  }

  return (
    <div className="min-h-screen bg-bg-base p-8 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-space-grotesk text-center text-text-primary">Buat Kelas Baru</CardTitle>
          <CardDescription className="text-center text-text-secondary">Isi detail kelas yang akan Anda ajarkan</CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-red-500 bg-red-100 p-3 rounded-md font-jetbrains-mono">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelas</Label>
              <Input id="name" name="name" placeholder="Contoh: Dasar Kelistrikan A" required className="border-border-muted focus-visible:ring-trace-teal" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input id="description" name="description" placeholder="Deskripsi singkat..." className="border-border-muted focus-visible:ring-trace-teal" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-trace-teal hover:bg-teal-600 text-white" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Buat Kelas"}
            </Button>
            <Link href="/dashboard" className="text-sm text-center text-text-secondary hover:underline">
              Batal dan Kembali
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
