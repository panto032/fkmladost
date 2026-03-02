import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCrudApi, type ContactMessage } from "@/lib/api.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Mail, MailOpen, Trash2, Clock } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";
import { toast } from "sonner";

export default function AdminContactMessages() {
  const qc = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["contactMessages"],
    queryFn: () => adminCrudApi.getContactMessages(),
  });

  const markRead = useMutation({
    mutationFn: (id: number) => adminCrudApi.markContactMessageRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contactMessages"] });
    },
    onError: () => toast.error("Greška pri označavanju poruke."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminCrudApi.deleteContactMessage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contactMessages"] });
      toast.success("Poruka obrisana.");
    },
    onError: () => toast.error("Greška pri brisanju poruke."),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const messageList = messages ?? [];

  if (messageList.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Mail />
          </EmptyMedia>
          <EmptyTitle>Nema poruka</EmptyTitle>
          <EmptyDescription>
            Kada neko pošalje poruku preko kontakt forme, pojaviće se ovde.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const unread = messageList.filter((m) => !m.isRead).length;

  return (
    <div>
      {unread > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          {unread} nepročitan{unread === 1 ? "a" : unread < 5 ? "e" : "ih"} poruk{unread === 1 ? "a" : unread < 5 ? "e" : "a"}
        </p>
      )}
      <div className="space-y-3">
        {messageList.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl border p-4 transition-colors ${
              msg.isRead
                ? "bg-card border-border"
                : "bg-[oklch(0.69_0.095_228)]/5 border-[oklch(0.69_0.095_228)]/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!msg.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[oklch(0.69_0.095_228)] flex-shrink-0" />
                  )}
                  <span className="font-semibold text-foreground truncate">
                    {msg.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {msg.email}
                  </span>
                </div>
                <p className="text-xs font-medium text-[oklch(0.69_0.095_228)] mb-1">
                  {msg.subject}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {msg.message}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {new Date(msg.createdAt).toLocaleDateString("sr-Latn-RS", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!msg.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => markRead.mutate(msg.id)}
                    title="Označi kao pročitano"
                  >
                    <MailOpen size={16} />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove.mutate(msg.id)}
                  title="Obriši"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
