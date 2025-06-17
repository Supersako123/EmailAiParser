export type EmailInfo = {
  id: string;
  href: string;
  date: string;
  content: string | null;
  subject: string | null;
  from: string | null;
  to: string | null;
};

export type EmailInfoAnalyzed = {
  id: string;
  href: string;
  date: string;
  content: string | null;
  subject: string | null;
  from: string | null;
  to: string | null;
  whatIsBeingPrinted: string | null;
  whoIsPrinting: string | null;
};

export type EmailAIResponse = {
  whatIsBeingPrinted: string;
  whoIsPrinting: string;
};
