export const metadata = {
  title: "Learn Next.js + Prisma + Docker",
  description: "Student starter project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 720,
          margin: "40px auto",
          padding: "0 16px",
          color: "#222",
        }}
      >
        {children}
      </body>
    </html>
  );
}
