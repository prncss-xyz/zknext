import clsx from "clsx";
import { Inter } from "next/font/google";
import { theme } from "@/theme.css";

import "the-new-css-reset/css/reset.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "zknext",
  description: "zknext",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={clsx(
          inter.className,
          theme,
        )}
      >
        {children}
      </body>
    </html>
  );
}
