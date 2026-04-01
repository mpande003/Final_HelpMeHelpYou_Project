export const metadata = {
  title: "Help me Help you — Donate",
};
import { redirect } from "next/navigation";

export default function DonatePage() {
  redirect("/login");
}
