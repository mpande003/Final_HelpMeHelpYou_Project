export const metadata = {
  title: "Help me Help you — Contact",
};
import { redirect } from "next/navigation";

export default function ContactPage() {
  redirect("/login");
}
