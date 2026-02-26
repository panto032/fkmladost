import { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.tsx";
import Header from "../home/_components/Header.tsx";
import Footer from "../home/_components/Footer.tsx";

type StaffMember = {
  name: string;
  role: string;
  category: string;
  imageUrl?: string;
  description?: string;
};

const STAFF: StaffMember[] = [
  {
    name: "Nikola Mijailović",
    role: "Šef stručnog štaba",
    category: "Trenerski tim",
    description:
      "Главни стратег и вођа стручног штаба FK Mladost Lučani. Одговоран за тактичку припрему и вођење тима на утакмицама.",
  },
  {
    name: "Goran Janković",
    role: "Prvi pomoćni trener",
    category: "Trenerski tim",
    description:
      "Десна рука шефа стручног штаба. Задужен за рад са одбрамбеном линијом и анализу противника.",
  },
  {
    name: "Nermin Useni",
    role: "Drugi pomoćni trener",
    category: "Trenerski tim",
    description:
      "Члан тренерског тима задужен за рад са везним редом и нападачима на тренинзима.",
  },
  {
    name: "Danijel Stojković",
    role: "Trener analitičar",
    category: "Trenerski tim",
    description:
      "Задужен за видео анализу утакмица, праћење перформанси играча и припрему тактичких извештаја.",
  },
  {
    name: "Zlatko Zečević",
    role: "Trener golmana",
    category: "Trenerski tim",
    description:
      "Специјалиста за рад са голманима. Задужен за индивидуални развој и тренинге голмана првог тима.",
  },
  {
    name: "Ivan Stevanović",
    role: "Trener fizičke spreme",
    category: "Stručni tim",
    description:
      "Задужен за физичку припрему играча, превенцију повреда и индивидуалне програме кондиционог тренинга.",
  },
  {
    name: "Snežana Markićević",
    role: "Lekar",
    category: "Medicinski tim",
    description:
      "Клупски лекар одговоран за здравље играча, медицинске прегледе и надзор над опоравком од повреда.",
  },
  {
    name: "Miloš Stojić",
    role: "Fizioterapeut",
    category: "Medicinski tim",
    description:
      "Задужен за физикалну терапију, рехабилитацију повређених играча и превентивне третмане.",
  },
  {
    name: "Srđan Kuzmanović",
    role: "Fizioterapeut",
    category: "Medicinski tim",
    description:
      "Члан медицинског тима задужен за масажу, опоравак играча после утакмица и тренинга.",
  },
];

const CATEGORIES = ["Trenerski tim", "Stručni tim", "Medicinski tim"];

function StaffCard({
  member,
  onClick,
}: {
  member: StaffMember;
  onClick: () => void;
}) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative overflow-hidden rounded-t-xl bg-[oklch(0.20_0.04_252)] aspect-[3/4]">
        {member.imageUrl ? (
          <img
            src={member.imageUrl}
            alt={member.name}
            className="w-full h-full object-cover group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 grayscale group-hover:grayscale-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[oklch(0.22_0.045_252)] to-[oklch(0.16_0.035_252)]">
            <User
              size={80}
              className="text-[oklch(0.30_0.04_252)] group-hover:text-[oklch(0.40_0.05_252)] transition-colors duration-300"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.035_252)] via-transparent to-transparent opacity-80" />
        {/* Role badge */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block bg-[oklch(0.69_0.095_228)]/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg backdrop-blur-sm">
            {member.role}
          </span>
        </div>
      </div>
      <div className="bg-[oklch(0.20_0.04_252)] p-4 rounded-b-xl border-t-2 border-[oklch(0.69_0.095_228)] group-hover:bg-[oklch(0.22_0.045_252)] transition-colors">
        <h5 className="font-bold text-lg md:text-xl truncate text-white">
          {member.name}
        </h5>
        <p className="text-[oklch(0.77_0.10_225)] text-sm">{member.role}</p>
      </div>
    </div>
  );
}

function StaffModal({
  member,
  open,
  onOpenChange,
}: {
  member: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[oklch(0.20_0.04_252)] border-[oklch(0.28_0.04_252)] text-white p-0 overflow-hidden sm:max-w-xl max-h-[90vh] overflow-y-auto"
        showCloseButton
      >
        {/* Hero image */}
        <div className="relative bg-[oklch(0.14_0.03_252)] overflow-hidden">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-full max-h-[50vh] object-contain mx-auto"
            />
          ) : (
            <div className="w-full h-56 flex items-center justify-center bg-gradient-to-b from-[oklch(0.22_0.045_252)] to-[oklch(0.16_0.035_252)]">
              <User size={100} className="text-[oklch(0.30_0.04_252)]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.20_0.04_252)] via-transparent to-transparent pointer-events-none" />
          {/* Role badge */}
          <div className="absolute bottom-3 right-3 bg-[oklch(0.69_0.095_228)] text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg uppercase tracking-wider">
            {member.role}
          </div>
        </div>

        {/* Info section */}
        <div className="px-5 pb-5 -mt-2 space-y-4">
          <DialogTitle className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {member.name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center bg-[oklch(0.69_0.095_228)]/15 text-[oklch(0.77_0.10_225)] rounded-full px-3 py-1 font-medium">
                  {member.role}
                </span>
                <span className="inline-flex items-center bg-[oklch(0.26_0.04_252)] text-[oklch(0.65_0.03_228)] rounded-full px-3 py-1">
                  {member.category}
                </span>
              </div>
              {member.description && (
                <p className="text-[oklch(0.60_0.03_252)] text-sm leading-relaxed">
                  {member.description}
                </p>
              )}
            </div>
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function StrucniStabPage() {
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(
    null
  );

  const grouped = CATEGORIES.reduce<Record<string, StaffMember[]>>(
    (acc, cat) => {
      acc[cat] = STAFF.filter((m) => m.category === cat);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero banner */}
      <section className="relative bg-[oklch(0.16_0.035_252)] text-white py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.22_0.045_252)] to-[oklch(0.16_0.035_252)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-[oklch(0.69_0.07_228)] hover:text-white text-sm font-medium transition-colors mb-6"
          >
            <ArrowLeft size={16} className="mr-1" /> Nazad na početnu
          </Link>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase">
            Stručni{" "}
            <span className="text-[oklch(0.77_0.10_225)]">Štab</span>
          </h2>
          <p className="text-lg text-[oklch(0.55_0.04_228)] max-w-2xl mt-3">
            Ljudi koji vode FK Mladost Lučani — sezonu 2025/2026
          </p>
        </div>
      </section>

      {/* Staff by category */}
      <section className="bg-[oklch(0.16_0.035_252)] pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {CATEGORIES.map((cat) => {
              const members = grouped[cat];
              if (!members || members.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight mb-6 border-b border-[oklch(0.26_0.04_252)] pb-3">
                    {cat}
                    <span className="text-accent ml-3 text-lg font-medium lowercase">
                      ({members.length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {members.map((member) => (
                      <StaffCard
                        key={member.name}
                        member={member}
                        onClick={() => setSelectedMember(member)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Staff detail modal */}
      <StaffModal
        member={selectedMember}
        open={selectedMember !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
      />

      <Footer />
    </div>
  );
}
