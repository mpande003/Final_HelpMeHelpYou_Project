export const metadata = {
  title: "Help me Help you — Admin",
};
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/login");
}
