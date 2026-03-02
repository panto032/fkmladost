import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api.ts";
import { useAuth } from "@/hooks/use-auth.ts";
import { toast } from "sonner";
import { Shield, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

/* ── Main component ── */
export default function AdminSettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success("Lozinka je uspešno promenjena");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Greška pri promeni lozinke"),
  });

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Sva polja su obavezna");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Nova lozinka i potvrda se ne poklapaju");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Nova lozinka mora imati najmanje 8 karaktera");
      return;
    }
    changePassword.mutate();
  };

  return (
    <div className="space-y-8 max-w-xl">
      {/* User info */}
      <div className="border border-border/50 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Korisnički nalog</h4>
        </div>
        {user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[oklch(0.22_0.06_250)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {(user.name || user.email || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user.name || "Bez imena"}</p>
                <p className="text-xs text-muted-foreground">{user.email || "—"}</p>
              </div>
            </div>
            {user.role && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-red-500/10 text-red-400">
                  <Shield size={12} />
                  {user.role === "admin" ? "Admin" : user.role === "editor" ? "Urednik" : "Pregled"}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Učitavanje...</p>
        )}
      </div>

      {/* Change password */}
      <div className="border border-border/50 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={16} className="text-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Promena lozinke</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Unesite trenutnu lozinku i novu lozinku (minimum 8 karaktera).
        </p>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Trenutna lozinka</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label>Nova lozinka</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label>Potvrdi novu lozinku</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChangePassword();
              }}
            />
          </div>
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={changePassword.isPending}
          className="w-full"
        >
          {changePassword.isPending ? "Menjanje..." : "Promeni lozinku"}
        </Button>
      </div>
    </div>
  );
}
