export const metadata = {
  title: "Help me Help you — About",
};
import { redirect } from "next/navigation";

export default function AboutPage() {
  redirect("/login");
}
