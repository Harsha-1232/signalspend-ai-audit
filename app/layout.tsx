import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "SignalSpend | AI Spend Audit",
  description: "Audit AI tool spend, find right-sized plans, and surface Credex-ready savings.",
  openGraph: {
    title: "SignalSpend AI Spend Audit",
    description: "A board-ready audit for startup AI tool spend.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SignalSpend AI Spend Audit",
    description: "Find practical monthly savings across AI tools."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
