import { useState, useEffect } from "react";
import { KeyRound, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { apiBaseUrl } from "@/lib/api.ts";

interface LicenseData {
  valid: boolean;
  checked: boolean;
  plan?: string;
  expiresAt?: string;
  daysLeft?: number;
  reason?: string;
}

export default function AdminLicense() {
  const [data, setData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rechecking, setRechecking] = useState(false);

  const fetchLicense = () => {
    setLoading(true);
    setError(null);
    fetch(`${apiBaseUrl}/api/license/status`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Nije moguće dohvatiti status licence.");
        setLoading(false);
      });
  };

  const recheckLicense = () => {
    setRechecking(true);
    setError(null);
    fetch(`${apiBaseUrl}/api/license/recheck`, { method: "POST" })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setRechecking(false);
      })
      .catch(() => {
        setError("Nije moguće proveriti licencu.");
        setRechecking(false);
      });
  };

  useEffect(() => {
    fetchLicense();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <div className="border border-border/50 rounded-lg p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLicense}>
            <RefreshCw size={14} className="mr-2" />
            Pokušaj ponovo
          </Button>
        </div>
      </div>
    );
  }

  const planLabel =
    data?.plan === "yearly" ? "Godišnja" : data?.plan === "monthly" ? "Mesečna" : "—";

  const expiresFormatted = data?.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("sr-Latn-RS", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const reasonLabel =
    data?.reason === "expired"
      ? "Istekla"
      : data?.reason === "suspended"
        ? "Suspendovana"
        : data?.reason === "invalid"
          ? "Nevalidna"
          : null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Status card */}
      <div className="border border-border/50 rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
            <KeyRound size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">IMPULSE Licenca</h3>
            <p className="text-xs text-muted-foreground">Status vaše licence</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          {data?.valid ? (
            <>
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-sm font-semibold text-green-500">Aktivna</span>
            </>
          ) : (
            <>
              <XCircle size={18} className="text-red-500" />
              <span className="text-sm font-semibold text-red-500">
                {reasonLabel ?? "Neaktivna"}
              </span>
            </>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCard label="Plan" value={planLabel} />
          <InfoCard label="Ističe" value={expiresFormatted} />
          <InfoCard
            label="Preostalo dana"
            value={data?.daysLeft != null ? String(data.daysLeft) : "—"}
            highlight={data?.daysLeft != null && data.daysLeft <= 14}
          />
        </div>

        {/* Warning if expiring soon */}
        {data?.valid && data?.daysLeft != null && data.daysLeft <= 14 && (
          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
            <Clock size={16} className="text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-200">
              Vaša licenca ističe za {data.daysLeft} dana. Kontaktirajte IMPULSE podršku za
              produženje.
            </p>
          </div>
        )}

        {!data?.valid && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-md p-3">
            <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300">
              Vaša licenca nije aktivna. Kontaktirajte IMPULSE podršku za pomoć.
            </p>
          </div>
        )}

        {/* Re-check button */}
        <Button
          variant="outline"
          size="sm"
          onClick={recheckLicense}
          disabled={rechecking}
          className="w-full"
        >
          <RefreshCw size={14} className={`mr-2 ${rechecking ? "animate-spin" : ""}`} />
          {rechecking ? "Proveravam..." : "Proveri ponovo"}
        </Button>
      </div>

      {/* Support link */}
      <div className="text-center">
        <a
          href="https://impulsee.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          impulsee.dev — podrška i informacije
        </a>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-muted/30 rounded-md p-3 space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-yellow-400" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
