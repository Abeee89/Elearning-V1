"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollStudent } from "@/actions/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function EnrollClassPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await enrollStudent(formData);
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
          <CardTitle className="text-2xl font-space-grotesk text-center text-text-primary">Gabung Kelas</CardTitle>
          <CardDescription className="text-center text-text-secondary">Masukkan ID Kelas dari guru Anda</CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm text-red-500 bg-red-100 p-3 rounded-md font-jetbrains-mono">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="classId">ID Kelas</Label>
              <Input id="classId" name="classId" placeholder="Masukkan ID Kelas (UUID)" required className="border-border-muted focus-visible:ring-trace-teal font-jetbrains-mono" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-trace-teal hover:bg-teal-600 text-white" disabled={isPending}>
              {isPending ? "Mendaftarkan..." : "Gabung"}
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
