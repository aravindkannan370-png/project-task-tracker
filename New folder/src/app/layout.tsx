import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Task Tracker",
  description: "Role-based project and task management for teams"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
