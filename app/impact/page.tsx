import { redirect } from "next/navigation";

export const metadata = {
  title: "Impact Map — Help me Help you",
};

export default function ImpactPage() {
  redirect("/login");
}
