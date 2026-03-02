import { KeyRound } from "lucide-react";

export default function AdminLicense() {
  return (
    <div className="max-w-2xl">
      <div className="border border-border/50 rounded-lg p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
          <KeyRound size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Licenciranje</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Upravljanje licencom nije dostupno u ovoj verziji.
        </p>
      </div>
    </div>
  );
}
