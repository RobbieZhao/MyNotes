import { redirect } from "next/navigation";

export default function LegacyDatasetsRedirectPage() {
  redirect("/datasets");
}
