export const metadata = {
  title: "Help me Help you — Events",
};
import { redirect } from "next/navigation";

export default function EventsPage() {
  redirect("/login");
}
