import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Pencil, Trash2, Plus, Trophy, Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

/* ------------------------------------------------------------------ */
/*  Static seed data — parsed from FSRZS Analyticom COMET images      */
/*  Prva pionirska liga FSRZS 25/26 — 2025/2026                      */
/* ------------------------------------------------------------------ */

const SEED_STANDINGS = [
  { position: 1, club: "Radnički 1923", played: 15, won: 15, drawn: 0, lost: 0, goalsFor: 79, goalsAgainst: 3, goalDiff: 76, points: 45, isHighlighted: false },
  { position: 2, club: "Mladost", played: 15, won: 13, drawn: 1, lost: 1, goalsFor: 43, goalsAgainst: 7, goalDiff: 36, points: 40, isHighlighted: true },
  { position: 3, club: "Novi Pazar", played: 15, won: 10, drawn: 2, lost: 3, goalsFor: 35, goalsAgainst: 16, goalDiff: 19, points: 32, isHighlighted: false },
  { position: 4, club: "Apolon 2018", played: 15, won: 9, drawn: 1, lost: 5, goalsFor: 19, goalsAgainst: 14, goalDiff: 5, points: 28, isHighlighted: false },
  { position: 5, club: "Loznica", played: 15, won: 8, drawn: 2, lost: 5, goalsFor: 36, goalsAgainst: 33, goalDiff: 3, points: 26, isHighlighted: false },
  { position: 6, club: "Pazar Juniors", played: 15, won: 7, drawn: 3, lost: 5, goalsFor: 35, goalsAgainst: 26, goalDiff: 9, points: 24, isHighlighted: false },
  { position: 7, club: "Mačva", played: 15, won: 7, drawn: 1, lost: 7, goalsFor: 32, goalsAgainst: 27, goalDiff: 5, points: 22, isHighlighted: false },
  { position: 8, club: "Apolon 4", played: 15, won: 7, drawn: 1, lost: 7, goalsFor: 29, goalsAgainst: 28, goalDiff: 1, points: 22, isHighlighted: false },
  { position: 9, club: "Kiker", played: 15, won: 7, drawn: 0, lost: 8, goalsFor: 26, goalsAgainst: 32, goalDiff: -6, points: 21, isHighlighted: false },
  { position: 10, club: "Radnički (VA)", played: 15, won: 5, drawn: 4, lost: 6, goalsFor: 17, goalsAgainst: 28, goalDiff: -11, points: 19, isHighlighted: false },
  { position: 11, club: "Petlić SD2006", played: 15, won: 4, drawn: 3, lost: 8, goalsFor: 13, goalsAgainst: 29, goalDiff: -16, points: 15, isHighlighted: false },
  { position: 12, club: "GFK Sloboda", played: 15, won: 4, drawn: 2, lost: 9, goalsFor: 25, goalsAgainst: 28, goalDiff: -3, points: 14, isHighlighted: false },
  { position: 13, club: "Borac 1926", played: 15, won: 4, drawn: 1, lost: 10, goalsFor: 11, goalsAgainst: 40, goalDiff: -29, points: 13, isHighlighted: false },
  { position: 14, club: "Smederevo 1924", played: 15, won: 3, drawn: 2, lost: 10, goalsFor: 14, goalsAgainst: 37, goalDiff: -23, points: 11, isHighlighted: false },
  { position: 15, club: "FK Sunrise Šabac", played: 15, won: 3, drawn: 0, lost: 12, goalsFor: 10, goalsAgainst: 39, goalDiff: -29, points: 9, isHighlighted: false },
  { position: 16, club: "Respekt", played: 15, won: 2, drawn: 1, lost: 12, goalsFor: 18, goalsAgainst: 55, goalDiff: -37, points: 7, isHighlighted: false },
];

const SEED_MATCHES: Array<{
  round: number;
  date: string;
  home: string;
  away: string;
  score?: string;
  city?: string;
  isHome: boolean;
}> = [
  // Kolo 1
  { round: 1, date: "15.08.2025", home: "Pazar Juniors", away: "Loznica", score: "3:3", city: "Novi Pazar", isHome: false },
  { round: 1, date: "15.08.2025", home: "Novi Pazar", away: "Kiker", score: "5:0", city: "Novi Pazar", isHome: false },
  { round: 1, date: "16.08.2025", home: "Petlić SD2006", away: "Borac 1926", score: "0:1", city: "Vranovo", isHome: false },
  { round: 1, date: "16.08.2025", home: "Radnički 1923", away: "FK Sunrise Šabac", score: "8:0", city: "Kragujevac", isHome: false },
  { round: 1, date: "17.08.2025", home: "Mačva", away: "Radnički (VA)", score: "1:1", city: "Šabac", isHome: false },
  { round: 1, date: "17.08.2025", home: "Mladost", away: "Respekt", score: "9:0", city: "Lučani", isHome: true },
  { round: 1, date: "17.08.2025", home: "GFK Sloboda", away: "Smederevo 1924", score: "4:1", city: "Sevojno", isHome: false },
  { round: 1, date: "17.08.2025", home: "Apolon 4", away: "Apolon 2018", score: "1:0", city: "Kragujevac", isHome: false },
  // Kolo 2
  { round: 2, date: "22.08.2025", home: "Smederevo 1924", away: "Radnički 1923", score: "0:5", city: "Smederevo", isHome: false },
  { round: 2, date: "23.08.2025", home: "Kiker", away: "Pazar Juniors", score: "0:1", city: "Kraljevo", isHome: false },
  { round: 2, date: "23.08.2025", home: "Radnički (VA)", away: "Apolon 4", score: "3:0", city: "Valjevo", isHome: false },
  { round: 2, date: "23.08.2025", home: "Loznica", away: "Mačva", score: "5:1", city: "Loznica", isHome: false },
  { round: 2, date: "23.08.2025", home: "Borac 1926", away: "FK Sunrise Šabac", score: "3:1", city: "Čačak", isHome: false },
  { round: 2, date: "24.08.2025", home: "Apolon 2018", away: "Mladost", score: "1:2", city: "Kovači", isHome: false },
  { round: 2, date: "24.08.2025", home: "Respekt", away: "GFK Sloboda", score: "1:5", city: "Loznica", isHome: false },
  { round: 2, date: "24.08.2025", home: "Petlić SD2006", away: "Novi Pazar", score: "1:3", city: "Vranovo", isHome: false },
  // Kolo 3
  { round: 3, date: "26.08.2025", home: "Mladost", away: "Radnički (VA)", score: "4:1", city: "Lučani", isHome: true },
  { round: 3, date: "27.08.2025", home: "Mačva", away: "Kiker", score: "6:0", city: "Šabac", isHome: false },
  { round: 3, date: "27.08.2025", home: "GFK Sloboda", away: "Apolon 2018", score: "0:1", city: "Užice", isHome: false },
  { round: 3, date: "27.08.2025", home: "Apolon 4", away: "Loznica", score: "3:4", city: "Kragujevac", isHome: false },
  { round: 3, date: "27.08.2025", home: "Radnički 1923", away: "Respekt", score: "7:0", city: "Kragujevac", isHome: false },
  { round: 3, date: "27.08.2025", home: "FK Sunrise Šabac", away: "Smederevo 1924", score: "2:0", city: "Šabac", isHome: false },
  { round: 3, date: "28.08.2025", home: "Novi Pazar", away: "Borac 1926", score: "4:0", city: "Novi Pazar", isHome: false },
  { round: 3, date: "28.08.2025", home: "Pazar Juniors", away: "Petlić SD2006", score: "4:1", city: "Novi Pazar", isHome: false },
  // Kolo 4
  { round: 4, date: "30.08.2025", home: "Kiker", away: "Apolon 4", score: "2:0", city: "Kraljevo", isHome: false },
  { round: 4, date: "30.08.2025", home: "Apolon 2018", away: "Radnički 1923", score: "1:3", city: "Kovači", isHome: false },
  { round: 4, date: "30.08.2025", home: "Petlić SD2006", away: "Mačva", score: "1:3", city: "Vranovo", isHome: false },
  { round: 4, date: "31.08.2025", home: "Respekt", away: "FK Sunrise Šabac", score: "1:2", city: "Loznica", isHome: false },
  { round: 4, date: "31.08.2025", home: "Radnički (VA)", away: "GFK Sloboda", score: "1:1", city: "Valjevo", isHome: false },
  { round: 4, date: "31.08.2025", home: "Borac 1926", away: "Smederevo 1924", score: "2:3", city: "Čačak", isHome: false },
  { round: 4, date: "31.08.2025", home: "Loznica", away: "Mladost", score: "1:5", city: "Loznica", isHome: false },
  { round: 4, date: "31.08.2025", home: "Novi Pazar", away: "Pazar Juniors", score: "2:2", city: "Novi Pazar", isHome: false },
  // Kolo 5
  { round: 5, date: "06.09.2025", home: "Apolon 4", away: "Petlić SD2006", score: "5:1", city: "Kragujevac", isHome: false },
  { round: 5, date: "06.09.2025", home: "FK Sunrise Šabac", away: "Apolon 2018", score: "0:1", city: "Šabac", isHome: false },
  { round: 5, date: "06.09.2025", home: "Pazar Juniors", away: "Borac 1926", score: "4:0", city: "Novi Pazar", isHome: false },
  { round: 5, date: "07.09.2025", home: "GFK Sloboda", away: "Loznica", score: "3:4", city: "Užice", isHome: false },
  { round: 5, date: "07.09.2025", home: "Mačva", away: "Novi Pazar", score: "0:2", city: "Šabac", isHome: false },
  { round: 5, date: "07.09.2025", home: "Smederevo 1924", away: "Respekt", score: "3:3", city: "Smederevo", isHome: false },
  { round: 5, date: "07.09.2025", home: "Mladost", away: "Kiker", score: "3:1", city: "Lučani", isHome: true },
  { round: 5, date: "07.09.2025", home: "Radnički 1923", away: "Radnički (VA)", score: "8:0", city: "Kragujevac", isHome: false },
  // Kolo 6
  { round: 6, date: "13.09.2025", home: "Radnički (VA)", away: "FK Sunrise Šabac", score: "1:0", city: "Valjevo", isHome: false },
  { round: 6, date: "13.09.2025", home: "Kiker", away: "GFK Sloboda", score: "1:3", city: "Kraljevo", isHome: false },
  { round: 6, date: "13.09.2025", home: "Borac 1926", away: "Respekt", score: "0:2", city: "Čačak", isHome: false },
  { round: 6, date: "13.09.2025", home: "Novi Pazar", away: "Apolon 4", score: "2:0", city: "Novi Pazar", isHome: false },
  { round: 6, date: "13.09.2025", home: "Loznica", away: "Radnički 1923", score: "0:3", city: "Loznica", isHome: false },
  { round: 6, date: "13.09.2025", home: "Pazar Juniors", away: "Mačva", score: "4:0", city: "Novi Pazar", isHome: false },
  { round: 6, date: "14.09.2025", home: "Petlić SD2006", away: "Mladost", score: "0:0", city: "Vranovo", isHome: false },
  { round: 6, date: "14.09.2025", home: "Apolon 2018", away: "Smederevo 1924", score: "3:0", city: "Vrnjačka Banja", isHome: false },
  // Kolo 7
  { round: 7, date: "20.09.2025", home: "Mačva", away: "Borac 1926", score: "5:0", city: "Šabac", isHome: false },
  { round: 7, date: "20.09.2025", home: "FK Sunrise Šabac", away: "Loznica", score: "1:2", city: "Šabac", isHome: false },
  { round: 7, date: "20.09.2025", home: "GFK Sloboda", away: "Petlić SD2006", score: "0:2", city: "Užice", isHome: false },
  { round: 7, date: "20.09.2025", home: "Respekt", away: "Apolon 2018", score: "2:3", city: "Loznica", isHome: false },
  { round: 7, date: "20.09.2025", home: "Apolon 4", away: "Pazar Juniors", score: "2:1", city: "Kragujevac", isHome: false },
  { round: 7, date: "20.09.2025", home: "Mladost", away: "Novi Pazar", score: "4:0", city: "Lučani", isHome: true },
  { round: 7, date: "21.09.2025", home: "Smederevo 1924", away: "Radnički (VA)", score: "3:0", city: "Smederevo", isHome: false },
  { round: 7, date: "21.09.2025", home: "Radnički 1923", away: "Kiker", score: "5:0", city: "Kragujevac", isHome: false },
  // Kolo 8
  { round: 8, date: "27.09.2025", home: "Radnički (VA)", away: "Respekt", score: "2:1", city: "Valjevo", isHome: false },
  { round: 8, date: "27.09.2025", home: "Kiker", away: "FK Sunrise Šabac", score: "6:0", city: "Kraljevo", isHome: false },
  { round: 8, date: "27.09.2025", home: "Mačva", away: "Apolon 4", score: "3:2", city: "Šabac", isHome: false },
  { round: 8, date: "27.09.2025", home: "Novi Pazar", away: "GFK Sloboda", score: "4:3", city: "Novi Pazar", isHome: false },
  { round: 8, date: "27.09.2025", home: "Loznica", away: "Smederevo 1924", score: "4:1", city: "Loznica", isHome: false },
  { round: 8, date: "27.09.2025", home: "Pazar Juniors", away: "Mladost", score: "1:4", city: "Novi Pazar", isHome: false },
  { round: 8, date: "28.09.2025", home: "Petlić SD2006", away: "Radnički 1923", score: "0:7", city: "Vranovo", isHome: false },
  { round: 8, date: "28.09.2025", home: "Borac 1926", away: "Apolon 2018", score: "1:0", city: "Čačak", isHome: false },
  // Kolo 9
  { round: 9, date: "04.10.2025", home: "FK Sunrise Šabac", away: "Petlić SD2006", score: "0:2", city: "Šabac", isHome: false },
  { round: 9, date: "04.10.2025", home: "Respekt", away: "Loznica", score: "2:4", city: "Loznica", isHome: false },
  { round: 9, date: "04.10.2025", home: "Mladost", away: "Mačva", score: "1:0", city: "Lučani", isHome: true },
  { round: 9, date: "04.10.2025", home: "Smederevo 1924", away: "Kiker", score: "0:1", city: "Smederevo", isHome: false },
  { round: 9, date: "05.10.2025", home: "GFK Sloboda", away: "Pazar Juniors", score: "1:2", city: "Sevojno", isHome: false },
  { round: 9, date: "05.10.2025", home: "Radnički 1923", away: "Novi Pazar", score: "2:0", city: "Kragujevac", isHome: false },
  { round: 9, date: "06.10.2025", home: "Apolon 2018", away: "Radnički (VA)", score: "0:1", city: "Vrnjačka Banja", isHome: false },
  { round: 9, date: "07.10.2025", home: "Apolon 4", away: "Borac 1926", score: "4:0", city: "Kragujevac", isHome: false },
  // Kolo 10
  { round: 10, date: "09.10.2025", home: "Mačva", away: "GFK Sloboda", score: "1:0", city: "Šabac", isHome: false },
  { round: 10, date: "11.10.2025", home: "Petlić SD2006", away: "Smederevo 1924", score: "1:0", city: "Vranovo", isHome: false },
  { round: 10, date: "11.10.2025", home: "Apolon 4", away: "Mladost", score: "0:1", city: "Kragujevac", isHome: false },
  { round: 10, date: "11.10.2025", home: "Pazar Juniors", away: "Radnički 1923", score: "1:3", city: "Novi Pazar", isHome: false },
  { round: 10, date: "11.10.2025", home: "Kiker", away: "Respekt", score: "5:1", city: "Kraljevo", isHome: false },
  { round: 10, date: "11.10.2025", home: "Loznica", away: "Apolon 2018", score: "1:2", city: "Loznica", isHome: false },
  { round: 10, date: "11.10.2025", home: "Novi Pazar", away: "FK Sunrise Šabac", score: "2:0", city: "Novi Pazar", isHome: false },
  { round: 10, date: "12.10.2025", home: "Borac 1926", away: "Radnički (VA)", score: "2:0", city: "Čačak", isHome: false },
  // Kolo 11
  { round: 11, date: "18.10.2025", home: "Mladost", away: "Borac 1926", score: "3:0", city: "Lučani", isHome: true },
  { round: 11, date: "18.10.2025", home: "FK Sunrise Šabac", away: "Pazar Juniors", score: "2:3", city: "Šabac", isHome: false },
  { round: 11, date: "19.10.2025", home: "Apolon 2018", away: "Kiker", score: "1:0", city: "Kovači", isHome: false },
  { round: 11, date: "19.10.2025", home: "Respekt", away: "Petlić SD2006", score: "1:2", city: "Loznica", isHome: false },
  { round: 11, date: "19.10.2025", home: "GFK Sloboda", away: "Apolon 4", score: "2:2", city: "Čajetina", isHome: false },
  { round: 11, date: "19.10.2025", home: "Radnički (VA)", away: "Loznica", score: "3:1", city: "Valjevo", isHome: false },
  { round: 11, date: "19.10.2025", home: "Smederevo 1924", away: "Novi Pazar", score: "1:1", city: "Smederevo", isHome: false },
  { round: 11, date: "19.10.2025", home: "Radnički 1923", away: "Mačva", score: "7:0", city: "Kragujevac", isHome: false },
  // Kolo 12
  { round: 12, date: "24.10.2025", home: "Mačva", away: "FK Sunrise Šabac", score: "5:0", city: "Šabac", isHome: false },
  { round: 12, date: "25.10.2025", home: "Kiker", away: "Radnički (VA)", score: "1:0", city: "Kraljevo", isHome: false },
  { round: 12, date: "25.10.2025", home: "Petlić SD2006", away: "Apolon 2018", score: "1:1", city: "Vranovo", isHome: false },
  { round: 12, date: "25.10.2025", home: "Apolon 4", away: "Radnički 1923", score: "1:8", city: "Kragujevac", isHome: false },
  { round: 12, date: "25.10.2025", home: "Pazar Juniors", away: "Smederevo 1924", score: "5:0", city: "Novi Pazar", isHome: false },
  { round: 12, date: "25.10.2025", home: "Mladost", away: "GFK Sloboda", score: "2:0", city: "Lučani", isHome: true },
  { round: 12, date: "26.10.2025", home: "Borac 1926", away: "Loznica", score: "0:0", city: "Čačak", isHome: false },
  { round: 12, date: "27.10.2025", home: "Novi Pazar", away: "Respekt", score: "4:1", city: "Novi Pazar", isHome: false },
  // Kolo 13
  { round: 13, date: "01.11.2025", home: "FK Sunrise Šabac", away: "Apolon 4", score: "1:2", city: "Šabac", isHome: false },
  { round: 13, date: "01.11.2025", home: "Apolon 2018", away: "Novi Pazar", score: "1:0", city: "Kovači", isHome: false },
  { round: 13, date: "01.11.2025", home: "Radnički 1923", away: "Mladost", score: "2:0", city: "Kragujevac", isHome: false },
  { round: 13, date: "01.11.2025", home: "Loznica", away: "Kiker", score: "5:2", city: "Loznica", isHome: false },
  { round: 13, date: "01.11.2025", home: "GFK Sloboda", away: "Borac 1926", score: "3:0", city: "Užice", isHome: false },
  { round: 13, date: "01.11.2025", home: "Respekt", away: "Pazar Juniors", score: "3:0", city: "Loznica", isHome: false },
  { round: 13, date: "02.11.2025", home: "Radnički (VA)", away: "Petlić SD2006", score: "0:0", city: "Valjevo", isHome: false },
  { round: 13, date: "03.11.2025", home: "Smederevo 1924", away: "Mačva", score: "2:1", city: "Smederevo", isHome: false },
  // Kolo 14
  { round: 14, date: "08.11.2025", home: "Borac 1926", away: "Kiker", score: "2:5", city: "Čačak", isHome: false },
  { round: 14, date: "08.11.2025", home: "Novi Pazar", away: "Radnički (VA)", score: "3:1", city: "Novi Pazar", isHome: false },
  { round: 14, date: "08.11.2025", home: "Mačva", away: "Respekt", score: "5:0", city: "Šabac", isHome: false },
  { round: 14, date: "08.11.2025", home: "Mladost", away: "FK Sunrise Šabac", score: "3:0", city: "Lučani", isHome: true },
  { round: 14, date: "08.11.2025", home: "Pazar Juniors", away: "Apolon 2018", score: "1:2", city: "Novi Pazar", isHome: false },
  { round: 14, date: "09.11.2025", home: "GFK Sloboda", away: "Radnički 1923", score: "0:5", city: "Zlatibor", isHome: false },
  { round: 14, date: "10.11.2025", home: "Apolon 4", away: "Smederevo 1924", score: "3:0", city: "Kragujevac", isHome: false },
  { round: 14, date: "10.11.2025", home: "Petlić SD2006", away: "Loznica", score: "1:2", city: "Vranovo", isHome: false },
  // Kolo 15
  { round: 15, date: "14.11.2025", home: "Smederevo 1924", away: "Mladost", score: "0:2", city: "Smederevo", isHome: false },
  { round: 15, date: "15.11.2025", home: "Kiker", away: "Petlić SD2006", score: "2:0", city: "Kraljevo", isHome: false },
  { round: 15, date: "15.11.2025", home: "FK Sunrise Šabac", away: "GFK Sloboda", score: "1:0", city: "Šabac", isHome: false },
  { round: 15, date: "16.11.2025", home: "Radnički 1923", away: "Borac 1926", score: "6:0", city: "Kragujevac", isHome: false },
  { round: 15, date: "16.11.2025", home: "Apolon 2018", away: "Mačva", score: "2:1", city: "Kovači", isHome: false },
  { round: 15, date: "16.11.2025", home: "Radnički (VA)", away: "Pazar Juniors", score: "3:3", city: "Valjevo", isHome: false },
  { round: 15, date: "16.11.2025", home: "Loznica", away: "Novi Pazar", score: "0:3", city: "Loznica", isHome: false },
  { round: 15, date: "16.11.2025", home: "Respekt", away: "Apolon 4", score: "0:4", city: "Loznica", isHome: false },
  // Kolo 16 (UNESEN — scheduled, no results)
  { round: 16, date: "", home: "Borac 1926", away: "Petlić SD2006", city: "Čačak", isHome: false },
  { round: 16, date: "", home: "Kiker", away: "Novi Pazar", city: "Kraljevo", isHome: false },
  { round: 16, date: "", home: "Loznica", away: "Pazar Juniors", city: "Loznica", isHome: false },
  { round: 16, date: "", home: "Radnički (VA)", away: "Mačva", city: "Valjevo", isHome: false },
  { round: 16, date: "", home: "Apolon 2018", away: "Apolon 4", city: "Kovači", isHome: false },
  { round: 16, date: "", home: "Respekt", away: "Mladost", city: "Loznica", isHome: false },
  { round: 16, date: "", home: "Smederevo 1924", away: "GFK Sloboda", city: "Smederevo", isHome: false },
  { round: 16, date: "", home: "FK Sunrise Šabac", away: "Radnički 1923", city: "Šabac", isHome: false },
  // Kolo 17 (UNESEN — scheduled, no results)
  { round: 17, date: "", home: "FK Sunrise Šabac", away: "Borac 1926", city: "Šabac", isHome: false },
  { round: 17, date: "", home: "Radnički 1923", away: "Smederevo 1924", city: "Kragujevac", isHome: false },
  { round: 17, date: "", home: "GFK Sloboda", away: "Respekt", city: "Užice", isHome: false },
  { round: 17, date: "", home: "Mladost", away: "Apolon 2018", city: "Lučani", isHome: true },
  { round: 17, date: "", home: "Apolon 4", away: "Radnički (VA)", city: "Kragujevac", isHome: false },
  { round: 17, date: "", home: "Mačva", away: "Loznica", city: "Šabac", isHome: false },
  { round: 17, date: "", home: "Pazar Juniors", away: "Kiker", city: "Novi Pazar", isHome: false },
  { round: 17, date: "", home: "Novi Pazar", away: "Petlić SD2006", city: "Novi Pazar", isHome: false },
];

/* ------------------------------------------------------------------ */
/*  Sub-tab selector                                                   */
/* ------------------------------------------------------------------ */

type SubTab = "standings" | "matches";

export default function AdminPioneerLeague() {
  const [subTab, setSubTab] = useState<SubTab>("standings");
  const seedMutation = useMutation(api.admin.pioneerLeague.seedPioneerLeague);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await seedMutation({
        standings: SEED_STANDINGS,
        matches: SEED_MATCHES,
      });
      toast.success(
        `Uspešno učitano: ${result.standings} klubova, ${result.matches} utakmica`,
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Greška pri sinhronizaciji");
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      {/* Sync banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
        <p className="text-sm text-muted-foreground">
          Povuci podatke — tabela i raspored (17 kola) Pionirske lige FSRZS 25/26.
        </p>
        <Button
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="gap-1.5 flex-shrink-0"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Učitavanje..." : "Sinhronizuj"}
        </Button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { id: "standings" as const, label: "Tabela", icon: Trophy },
          { id: "matches" as const, label: "Utakmice", icon: Calendar },
        ]).map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              size="sm"
              variant={subTab === tab.id ? "default" : "ghost"}
              onClick={() => setSubTab(tab.id)}
              className="gap-1.5"
            >
              <Icon size={14} />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {subTab === "standings" && <StandingsAdmin />}
      {subTab === "matches" && <MatchesAdmin />}
    </div>
  );
}

/* ================================================================== */
/*  Standings Admin                                                    */
/* ================================================================== */

type StandingDoc = Doc<"pioneerStandings">;

const EMPTY_STANDING = {
  position: 1, club: "", played: 0, won: 0, drawn: 0, lost: 0,
  goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0, isHighlighted: false,
};

function StandingsAdmin() {
  const standings = useQuery(api.admin.pioneerLeague.getStandings);
  const create = useMutation(api.admin.pioneerLeague.createStanding);
  const update = useMutation(api.admin.pioneerLeague.updateStanding);
  const remove = useMutation(api.admin.pioneerLeague.removeStanding);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<StandingDoc | null>(null);
  const [form, setForm] = useState(EMPTY_STANDING);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_STANDING, position: (standings?.length ?? 0) + 1 }); setIsOpen(true); };
  const openEdit = (item: StandingDoc) => {
    setEditing(item);
    setForm({ position: item.position, club: item.club, played: item.played, won: item.won, drawn: item.drawn, lost: item.lost, goalsFor: item.goalsFor, goalsAgainst: item.goalsAgainst, goalDiff: item.goalDiff, points: item.points, isHighlighted: item.isHighlighted });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.club) { toast.error("Ime kluba je obavezno"); return; }
    setSaving(true);
    try {
      if (editing) { await update({ id: editing._id, ...form }); toast.success("Ažurirano"); }
      else { await create(form); toast.success("Dodat"); }
      setIsOpen(false);
    } catch (error) {
      if (error instanceof ConvexError) { toast.error((error.data as { message: string }).message); }
      else { toast.error("Greška pri čuvanju"); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: StandingDoc["_id"]) => {
    try { await remove({ id }); toast.success("Obrisano"); }
    catch (error) { if (error instanceof ConvexError) { toast.error((error.data as { message: string }).message); } else { toast.error("Greška"); } }
  };

  if (standings === undefined) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Tabela Pionirske Lige ({standings.length} klubova)</h3>
        <Button onClick={openCreate} size="sm"><Plus size={16} /> Dodaj</Button>
      </div>
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Klub</TableHead>
              <TableHead className="hidden sm:table-cell">U</TableHead>
              <TableHead className="hidden sm:table-cell">P</TableHead>
              <TableHead className="hidden md:table-cell">N</TableHead>
              <TableHead className="hidden md:table-cell">I</TableHead>
              <TableHead className="hidden lg:table-cell">G+</TableHead>
              <TableHead className="hidden lg:table-cell">G-</TableHead>
              <TableHead>Bod</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((item) => (
              <TableRow key={item._id} className={item.isHighlighted ? "bg-accent/10" : ""}>
                <TableCell className="font-bold text-muted-foreground">{item.position}.</TableCell>
                <TableCell className={`font-medium ${item.isHighlighted ? "text-accent font-bold" : ""}`}>{item.club}</TableCell>
                <TableCell className="hidden sm:table-cell">{item.played}</TableCell>
                <TableCell className="hidden sm:table-cell">{item.won}</TableCell>
                <TableCell className="hidden md:table-cell">{item.drawn}</TableCell>
                <TableCell className="hidden md:table-cell">{item.lost}</TableCell>
                <TableCell className="hidden lg:table-cell">{item.goalsFor}</TableCell>
                <TableCell className="hidden lg:table-cell">{item.goalsAgainst}</TableCell>
                <TableCell className="font-bold">{item.points}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                    <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Uredi klub" : "Dodaj klub"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Pozicija</Label><Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} min={1} /></div>
              <div className="space-y-2"><Label>Klub</Label><Input value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} placeholder="Mladost" /></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2"><Label>Odigrano</Label><Input type="number" value={form.played} onChange={(e) => setForm({ ...form, played: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Pobede</Label><Input type="number" value={form.won} onChange={(e) => setForm({ ...form, won: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Nerešeno</Label><Input type="number" value={form.drawn} onChange={(e) => setForm({ ...form, drawn: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Porazi</Label><Input type="number" value={form.lost} onChange={(e) => setForm({ ...form, lost: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2"><Label>Golovi +</Label><Input type="number" value={form.goalsFor} onChange={(e) => setForm({ ...form, goalsFor: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Golovi -</Label><Input type="number" value={form.goalsAgainst} onChange={(e) => setForm({ ...form, goalsAgainst: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Gol razlika</Label><Input type="number" value={form.goalDiff} onChange={(e) => setForm({ ...form, goalDiff: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Bodovi</Label><Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isHighlighted} onCheckedChange={(checked) => setForm({ ...form, isHighlighted: checked })} />
              <Label>Istakni (Mladost)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Čuvanje..." : editing ? "Sačuvaj" : "Kreiraj"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================================================================== */
/*  Matches Admin                                                      */
/* ================================================================== */

type MatchDoc = Doc<"pioneerMatches">;

const EMPTY_MATCH = {
  round: 1, date: "", home: "", away: "",
  score: "" as string | undefined, city: "" as string | undefined, isHome: false,
};

function MatchesAdmin() {
  const matches = useQuery(api.admin.pioneerLeague.getMatches);
  const createMatch = useMutation(api.admin.pioneerLeague.createMatch);
  const updateMatch = useMutation(api.admin.pioneerLeague.updateMatch);
  const removeMatch = useMutation(api.admin.pioneerLeague.removeMatch);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<MatchDoc | null>(null);
  const [form, setForm] = useState(EMPTY_MATCH);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY_MATCH }); setIsOpen(true); };
  const openEdit = (item: MatchDoc) => {
    setEditing(item);
    setForm({ round: item.round, date: item.date, home: item.home, away: item.away, score: item.score ?? "", city: item.city ?? "", isHome: item.isHome });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.home || !form.away) { toast.error("Timovi su obavezni"); return; }
    setSaving(true);
    try {
      const payload = { round: form.round, date: form.date, home: form.home, away: form.away, score: form.score || undefined, city: form.city || undefined, isHome: form.isHome };
      if (editing) { await updateMatch({ id: editing._id, ...payload }); toast.success("Ažurirano"); }
      else { await createMatch(payload); toast.success("Dodato"); }
      setIsOpen(false);
    } catch (error) {
      if (error instanceof ConvexError) { toast.error((error.data as { message: string }).message); }
      else { toast.error("Greška pri čuvanju"); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: MatchDoc["_id"]) => {
    try { await removeMatch({ id }); toast.success("Obrisano"); }
    catch (error) { if (error instanceof ConvexError) { toast.error((error.data as { message: string }).message); } else { toast.error("Greška"); } }
  };

  if (matches === undefined) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;

  // Group by round
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Sve utakmice ({matches.length})</h3>
        <Button onClick={openCreate} size="sm"><Plus size={16} /> Dodaj</Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Kolo</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Domaćin</TableHead>
              <TableHead>Gost</TableHead>
              <TableHead>Rezultat</TableHead>
              <TableHead className="hidden sm:table-cell">Grad</TableHead>
              <TableHead className="w-24 text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rounds.flatMap((round) =>
              matches.filter((m) => m.round === round).map((item) => {
                const isMladost = item.home.includes("Mladost") || item.away.includes("Mladost");
                return (
                  <TableRow key={item._id} className={isMladost ? "bg-accent/10" : ""}>
                    <TableCell className="font-bold text-muted-foreground">{item.round}</TableCell>
                    <TableCell className="text-sm">{item.date || "—"}</TableCell>
                    <TableCell className={`font-medium ${item.home.includes("Mladost") ? "text-accent font-bold" : ""}`}>{item.home}</TableCell>
                    <TableCell className={`font-medium ${item.away.includes("Mladost") ? "text-accent font-bold" : ""}`}>{item.away}</TableCell>
                    <TableCell className="font-bold">{item.score || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{item.city || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                        <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item._id)}><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Uredi utakmicu" : "Dodaj utakmicu"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Kolo</Label><Input type="number" value={form.round} onChange={(e) => setForm({ ...form, round: Number(e.target.value) })} min={1} /></div>
              <div className="space-y-2"><Label>Datum</Label><Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="01.03.2026" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Domaćin</Label><Input value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })} /></div>
              <div className="space-y-2"><Label>Gost</Label><Input value={form.away} onChange={(e) => setForm({ ...form, away: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Rezultat</Label><Input value={form.score ?? ""} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="2:1" /></div>
              <div className="space-y-2"><Label>Grad</Label><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isHome} onCheckedChange={(checked) => setForm({ ...form, isHome: checked })} />
              <Label>Mladost je domaćin</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Otkaži</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Čuvanje..." : editing ? "Sačuvaj" : "Kreiraj"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
