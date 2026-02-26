import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useState } from "react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import {
  KeyRound,
  ShieldCheck,
  User,
  Mail,
  CalendarClock,
  Package,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { cn } from "@/lib/utils.ts";

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  active: {
    label: "Aktivna",
    icon: <CheckCircle2 size={16} />,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  expired: {
    label: "Istekla",
    icon: <XCircle size={16} />,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  grace_period: {
    label: "Grejs period",
    icon: <AlertTriangle size={16} />,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  revoked: {
    label: "Opozvana",
    icon: <XCircle size={16} />,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  inactive: {
    label: "Neaktivna",
    icon: <Clock size={16} />,
    color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  },
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/30 last:border-b-0">
      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-all">{value}</p>
      </div>
    </div>
  );
}

export default function AdminLicense() {
  const license = useQuery(api.licenseStore.get);
  const validateLicense = useAction(api.licenseAction.validateLicense);
  const [refreshing, setRefreshing] = useState(false);

  if (license === undefined) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!license) {
    return (
      <div className="max-w-2xl">
        <div className="border border-border/50 rounded-lg p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <KeyRound size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Nema aktivne licence</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Licenca nije aktivirana. Aktivirajte licencu ponovnim prijavljivanjem na admin panel.
          </p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_MAP[license.status] ?? STATUS_MAP.inactive;

  const formatDate = (iso: string | undefined) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const formatLastChecked = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) + " u " + d.toLocaleTimeString("sr-Latn-RS", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const maskedKey = license.key.length > 8
    ? license.key.slice(0, 4) + "••••••••" + license.key.slice(-4)
    : "••••••••";

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await validateLicense({ key: license.key });
      if (data.valid) {
        toast.success("Licenca je validna");
      } else {
        toast.error(data.message || "Licenca nije validna");
      }
    } catch (err) {
      if (err instanceof ConvexError) {
        const { message } = err.data as { message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri proveri licence");
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Status card */}
      <div className={cn(
        "border rounded-lg p-5 flex items-center justify-between",
        statusConfig.color
      )}>
        <div className="flex items-center gap-3">
          {statusConfig.icon}
          <div>
            <p className="text-sm font-bold">Status licence</p>
            <p className="text-lg font-extrabold uppercase tracking-wide">
              {statusConfig.label}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          {refreshing ? <Spinner /> : <RefreshCw size={14} />}
          Proveri
        </Button>
      </div>

      {/* Details card */}
      <div className="border border-border/50 rounded-lg">
        <div className="px-5 py-4 border-b border-border/30">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Detalji licence
          </h3>
        </div>
        <div className="px-5">
          <InfoRow
            icon={<KeyRound size={16} />}
            label="Licencni ključ"
            value={maskedKey}
          />
          <InfoRow
            icon={<Package size={16} />}
            label="Proizvod"
            value={license.productName}
          />
          <InfoRow
            icon={<User size={16} />}
            label="Vlasnik licence"
            value={license.customerName}
          />
          <InfoRow
            icon={<Mail size={16} />}
            label="Email"
            value={license.customerEmail}
          />
          <InfoRow
            icon={<CalendarClock size={16} />}
            label="Ističe"
            value={formatDate(license.expiresAt)}
          />
          <InfoRow
            icon={<ShieldCheck size={16} />}
            label="Status"
            value={statusConfig.label}
          />
          <InfoRow
            icon={<Clock size={16} />}
            label="Poslednja provera"
            value={formatLastChecked(license.lastChecked)}
          />
        </div>
      </div>
    </div>
  );
}
