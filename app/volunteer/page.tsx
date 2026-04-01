import { redirect } from "next/navigation";

export const metadata = {
  title: "Volunteer — Help me Help you",
};

export default function VolunteerPage() {
  redirect("/volunteer-registration.html");
}
