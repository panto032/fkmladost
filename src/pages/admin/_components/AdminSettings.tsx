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
  Mail,
  Send,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Input } from "@/components/ui/input.tsx";
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

function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_CONFIG[role];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium", config.color)}>
      {config.icon}
      {config.label}
    </span>
  );
}

/* ── Invite form ── */
function InviteForm() {
  const sendInvitation = useMutation(api.team.sendInvitation);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      await sendInvitation({ email: email.trim(), role });
      toast.success(`Pozivnica poslata na ${email.trim()}`);
      setEmail("");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri slanju pozivnice");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border border-border/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Mail size={16} className="text-foreground" />
        <h4 className="text-sm font-semibold text-foreground">Pošalji pozivnicu</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Unesite email adresu osobe koju želite da pozovete. Kada se ta osoba prijavi sa tim emailom, automatski dobija pristup.
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="ime@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          className="flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary" className="gap-1.5 flex-shrink-0">
              {ROLE_CONFIG[role].icon}
              {ROLE_CONFIG[role].label}
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => (
              <DropdownMenuItem key={r} onClick={() => setRole(r)}>
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 font-medium">
                    {ROLE_CONFIG[r].icon}
                    {ROLE_CONFIG[r].label}
                  </span>
                  <span className="text-xs text-muted-foreground">{ROLE_CONFIG[r].description}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" onClick={handleSend} disabled={!email.trim() || sending} className="gap-1.5 flex-shrink-0">
          <Send size={14} />
          Pošalji
        </Button>
      </div>
    </div>
  );
}

/* ── Pending invitations ── */
function InvitationRow({ invitation }: { invitation: Doc<"invitations"> }) {
  const cancelInvitation = useMutation(api.team.cancelInvitation);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelInvitation({ invitationId: invitation._id });
      toast.success("Pozivnica obrisana");
      setConfirmCancel(false);
    } catch {
      toast.error("Greška pri brisanju pozivnice");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
            {invitation.accepted ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <Clock size={16} className="text-amber-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{invitation.email}</p>
            <p className="text-xs text-muted-foreground">
              {invitation.accepted ? "Prihvaćena" : "Čeka prijavu"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <RoleBadge role={invitation.role} />
          {!invitation.accepted && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              onClick={() => setConfirmCancel(true)}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Obriši pozivnicu</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete pozivnicu za <strong>{invitation.email}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Otkaži</Button>
            <Button variant="destructive" onClick={handleCancel}>Obriši</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Team member row ── */
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
      toast.success(`Uloga promenjena u ${ROLE_CONFIG[newRole].label}`);
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
        toast.error("Greška pri uklanjanju");
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
          <RoleBadge role={member.role as Role} />

          {!isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={cn(member.role === r && "bg-muted")}
                  >
                    <span className="flex items-center gap-2">
                      {ROLE_CONFIG[r].icon}
                      {ROLE_CONFIG[r].label}
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

/* ── Main component ── */
export default function AdminSettings() {
  const members = useQuery(api.team.listMembers);
  const invitations = useQuery(api.team.listInvitations);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (members === undefined || invitations === undefined || currentUser === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const pendingInvitations = invitations.filter((i) => !i.accepted);
  const acceptedInvitations = invitations.filter((i) => i.accepted);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Invite form */}
      <InviteForm />

      {/* Team members */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-foreground" />
          <h3 className="text-lg font-bold text-foreground">Članovi tima ({members.length})</h3>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nema članova tima.</p>
        ) : (
          <div className="divide-y divide-border/50 border border-border/50 rounded-lg">
            {members.map((m) => (
              <MemberRow key={m._id} member={m} currentUserId={currentUser?._id ?? ("" as Id<"users">)} />
            ))}
          </div>
        )}
      </div>

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-amber-500" />
            <h3 className="text-lg font-bold text-foreground">
              Pozivnice na čekanju ({pendingInvitations.length})
            </h3>
          </div>
          <div className="divide-y divide-border/50 border border-border/50 rounded-lg">
            {pendingInvitations.map((inv) => (
              <InvitationRow key={inv._id} invitation={inv} />
            ))}
          </div>
        </div>
      )}

      {/* Accepted invitations */}
      {acceptedInvitations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <h3 className="text-lg font-bold text-foreground">
              Prihvaćene pozivnice ({acceptedInvitations.length})
            </h3>
          </div>
          <div className="divide-y divide-border/50 border border-border/50 rounded-lg">
            {acceptedInvitations.map((inv) => (
              <InvitationRow key={inv._id} invitation={inv} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
