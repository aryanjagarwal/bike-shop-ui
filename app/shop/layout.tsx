import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop - Bicycle Shop",
  description: "Browse our collection of bicycles and parts",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
