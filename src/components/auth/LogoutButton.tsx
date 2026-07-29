import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button variant="outline" type="submit" className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400">
        <LogOut className="w-4 h-4 mr-2" />
        Keluar
      </Button>
    </form>
  );
}
