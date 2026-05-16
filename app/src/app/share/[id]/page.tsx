import { Metadata } from "next";
import { SharePageClient } from "./SharePageClient";

export const metadata: Metadata = {
  title: "浮生记 · 分享",
  description: "一篇来自浮生记的文字",
};

export default function SharePage({ params }: { params: { id: string } }) {
  return <SharePageClient id={params.id} />;
}
