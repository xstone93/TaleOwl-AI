// src/app/layout.tsx
import '../styles/globals.css';

export const metadata = {
  title: 'Tale Owl AI',
  description: 'Welcome to the world of Tale Owl AI where you can talk to books',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}