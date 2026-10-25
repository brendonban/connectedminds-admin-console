import "./globals.css";

export const metadata = {
  title: "Connected Minds Admin",
  description: "Internal admin console for the Connected Minds website content.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
