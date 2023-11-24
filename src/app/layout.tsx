import clsx from "clsx";
/* import { Inter } from "next/font/google"; */
import { theme } from "@/theme.css";
import { Box } from "@/components/box";

import "the-new-css-reset/css/reset.css";

/* const inter = Inter({ subsets: ["latin"], display: "swap" }); */

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
      <Box
        as="body"
        className={clsx(
          /* inter.className, */
          theme
        )}
        mx={{ xs: 0, md: 20 }}
        my={{ xs: 10, md: 20 }}
        display="flex"
        flexDirection="row"
        justifyContent="center"
      >
        {children}
      </Box>
    </html>
  );
}
