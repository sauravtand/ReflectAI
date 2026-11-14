export type JournalMode = "normal" | "ai";
export type JournalEntry = { id:string; title:string; excerpt:string; date:string; mode:JournalMode; minutes:number; words:number };
export const journalEntries: JournalEntry[] = [
 {id:"morning-walk",title:"A quiet morning walk",excerpt:"The air was cold, and the streets felt unusually calm...",date:"2026-11-14",mode:"normal",minutes:8,words:342},
 {id:"project-reflection",title:"What I learned this week",excerpt:"Breaking the work into smaller steps made the uncertainty easier...",date:"2026-11-12",mode:"ai",minutes:14,words:518},
 {id:"gratitude",title:"Three things I noticed",excerpt:"A kind message, warm coffee, and a moment without rushing...",date:"2026-11-09",mode:"normal",minutes:6,words:241},
];
export const stats={entries:12,streak:4,words:3840,minutes:126};
