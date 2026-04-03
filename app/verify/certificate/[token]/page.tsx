import { PublicSiteShell } from "@/app/components/marketing/PublicSiteShell";
import supabase from "@/lib/db";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Verify Certificate | Help Me Help You",
  description: "Check the authenticity of NGO-issued certificates.",
};

export default async function CertificateVerificationPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;

  const { data: issuance, error } = await supabase
    .from("certificate_issuances")
    .select("*, certificate_templates(name)")
    .eq("token_id", token)
    .single();

  if (error || !issuance) {
    notFound();
  }

  return (
    <PublicSiteShell activePath="/verify">
      <div className="container min-h-[70vh] py-16 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(75,48,42,0.1)] border border-[#e0c4ba] p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
           <div className="mx-auto w-20 h-20 bg-[#fff8f0] rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner ring-4 ring-white">
             🏆
           </div>
           
           <h1 className="text-3xl font-extrabold text-[#4b302a] tracking-tight">Verified Certificate</h1>
           <p className="mt-3 text-[#7a5a4d] px-6">This official record has been authenticated as a valid issuance from the <span className="font-semibold">Help Me Help You (CEP)</span> NGO registry.</p>
           
           <div className="mt-10 grid gap-8 text-left sm:grid-cols-2 bg-[#fffdfa] rounded-2xl p-8 border border-[#f5efec]">
              <div className="space-y-1">
                 <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#b08d7e]">Recipient Name</p>
                 <p className="text-xl font-bold text-[#4b302a]">{issuance.recipient_name}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#b08d7e]">Certificate Category</p>
                 <p className="text-xl font-bold text-[#4b302a]">{issuance.certificate_templates?.name || "Official Recognition"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#b08d7e]">Event / Initiative</p>
                 <p className="text-xl font-bold text-[#4b302a]">{issuance.event_name}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#b08d7e]">Issue Date</p>
                 <p className="text-xl font-bold text-[#4b302a]">{new Date(issuance.issued_at).toLocaleDateString()}</p>
              </div>
              <div className="sm:col-span-2 pt-4 mt-4 border-t border-[#f0e6e2] flex flex-col items-center">
                 <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#b08d7e] mb-2">Unique Verification Token</p>
                 <p className="font-mono text-lg bg-[#fff8e8] px-4 py-2 rounded-lg border border-[#fec288] text-[#4b302a] font-bold tracking-wider">
                   {issuance.token_id}
                 </p>
              </div>
           </div>
           
           <div className="mt-10 pt-4 text-sm text-[#7a5a4d] max-w-sm mx-auto leading-relaxed italic opacity-80">
             &ldquo;Acknowledged for leadership, service, and commitment to humanitarian causes.&rdquo;
           </div>
           
           <div className="mt-10">
             <a href="/" className="inline-flex items-center text-sm font-semibold text-[#4b302a] hover:underline">
               ← Back to helpmehelpyou.in
             </a>
           </div>
        </div>
      </div>
    </PublicSiteShell>
  );
}
