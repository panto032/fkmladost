import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useState } from "react";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import {
  Shield,
  Pencil,
  Eye,
  UserMinus,
  ChevronDown,
  Users,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { cn } from "@/lib/utils.ts";

type Role = "admin" | "editor" | "viewer";

const ROLE_CONFIG: Record<Role, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  admin: {
    label: "Admin",
    description: "Pun pristup — može da menja sve i upravlja timom",
    icon: <Shield size={14} />,
    color: "text-red-400 bg-red-500/10",
  },
  editor: {
    label: "Urednik",
    description: "Može da dodaje i menja sadržaj, ali ne upravlja timom",
    icon: <Pencil size={14} />,
    color: "text-blue-400 bg-blue-500/10",
  },
  viewer: {
    label: "Pregled",
    description: "Samo čitanje — može da vidi admin panel bez izmena",
    icon: <Eye size={14} />,
    color: "text-emerald-400 bg-emerald-500/10",
  },
};

function RoleBadge({ role }: { role: Role | undefined }) {
  if (!role) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-muted-foreground bg-muted/50">
        Bez uloge
      </span>
    );
  }
  const config = ROLE_CONFIG[role];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium", config.color)}>
      {config.icon}
      {config.label}
    </span>
  );
}

function MemberRow({
  member,
  currentUserId,
}: {
  member: Doc<"users">;
  currentUserId: Id<"users">;
}) {
  const updateRole = useMutation(api.team.updateRole);
  const removeMember = useMutation(api.team.removeMember);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const isCurrentUser = member._id === currentUserId;

  const handleRoleChange = async (newRole: Role) => {
    try {
      await updateRole({ userId: member._id, role: newRole });
      toast.success(`Uloga za ${member.name || member.email} promenjena u ${ROLE_CONFIG[newRole].label}`);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri promeni uloge");
      }
    }
  };

  const handleRemove = async () => {
    try {
      await removeMember({ userId: member._id });
      toast.success(`${member.name || member.email} uklonjen iz tima`);
      setConfirmRemove(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri uklanjanju člana");
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/30 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[oklch(0.22_0.06_250)] flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
            {(member.name || member.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {member.name || "Bez imena"}
              </p>
              {isCurrentUser && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Vi</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{member.email || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <RoleBadge role={member.role as Role | undefined} />

          {!isCurrentUser && member.role && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(ROLE_CONFIG) as Role[]).map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={cn(member.role === role && "bg-muted")}
                  >
                    <span className="flex items-center gap-2">
                      {ROLE_CONFIG[role].icon}
                      {ROLE_CONFIG[role].label}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => setConfirmRemove(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <span className="flex items-center gap-2">
                    <UserMinus size={14} />
                    Ukloni iz tima
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ukloni člana tima</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da uklonite <strong>{member.name || member.email}</strong> iz tima?
              Korisnik će izgubiti pristup admin panelu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmRemove(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={handleRemove}>Ukloni</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminSettings() {
  const members = useQuery(api.team.listMembers);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (members === undefined || currentUser === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const teamMembers = members.filter((m) => m.role);
  const otherUsers = members.filter((m) => !m.role);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
        <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>
            Korisnici koji se prijave na sajt automatski se pojavljuju ovde.
            Dodelite im ulogu da bi dobili pristup admin panelu.
          </p>
        </div>
      </div>

      {/* Team members */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-foreground" />
          <h3 className="text-lg font-bold text-foreground">Članovi tima ({teamMembers.length})</h3>
        </div>
        {teamMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nema članova tima. Dodelite ulogu korisnicima ispod.</p>
        ) : (
          <div className="divide-y divide-border/50 border border-border/50 rounded-lg">
            {teamMembers.map((m) => (
              <MemberRow key={m._id} member={m} currentUserId={currentUser?._id ?? ("" as Id<"users">)} />
            ))}
          </div>
        )}
      </div>

      {/* Other registered users */}
      {otherUsers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-muted-foreground" />
            <h3 className="text-lg font-bold text-foreground">
              Registrovani korisnici ({otherUsers.length})
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Ovi korisnici su se prijavili ali nemaju ulogu. Dodelite ulogu da bi dobili pristup.
          </p>
          <div className="divide-y divide-border/50 border border-border/50 rounded-lg">
            {otherUsers.map((m) => (
              <UserWithoutRole key={m._id} member={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserWithoutRole({ member }: { member: Doc<"users"> }) {
  const updateRole = useMutation(api.team.updateRole);

  const handleAssign = async (role: Role) => {
    try {
      await updateRole({ userId: member._id, role });
      toast.success(`${member.name || member.email} dodat kao ${ROLE_CONFIG[role].label}`);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri dodeljivanju uloge");
      }
    }
  };

  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground text-sm font-bold">
          {(member.name || member.email || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{member.name || "Bez imena"}</p>
          <p className="text-xs text-muted-foreground truncate">{member.email || "—"}</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary" className="gap-1.5">
            Dodeli ulogu
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.keys(ROLE_CONFIG) as Role[]).map((role) => (
            <DropdownMenuItem key={role} onClick={() => handleAssign(role)}>
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-medium">
                  {ROLE_CONFIG[role].icon}
                  {ROLE_CONFIG[role].label}
                </span>
                <span className="text-xs text-muted-foreground">{ROLE_CONFIG[role].description}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
