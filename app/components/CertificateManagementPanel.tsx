"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { AppEvent } from "@/lib/events";
import type { Volunteer } from "@/lib/volunteers";
import type { Beneficiary } from "@/lib/beneficiaries";
import type { BloodDonor } from "@/lib/blood";
import type { CertificateTemplate, CertificateField } from "@/lib/certificates";
import Draggable from "react-draggable";
import {
  createTemplate,
  uploadTemplateImage,
  deleteTemplate,
  updateTemplate,
  recordIssuance,
  generateTokenId,
} from "@/lib/certificates";
import {
  internalCardClassName,
  internalPrimaryButtonClassName,
  internalSecondaryButtonClassName,
} from "./internalTheme";

// DraggableField helper with relative percentage positioning
function DraggableField({ field, onStop, children }: { 
  field: CertificateField; 
  onStop: (e: any, data: any) => void; 
  children: ReactNode;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      position={{ x: 0, y: 0 }}
      onStop={onStop}
    >
      <div 
        ref={nodeRef}
        style={{
          position: "absolute",
          left: `${field.x}%`,
          top: `${field.y}%`,
          fontSize: `${field.fontSize}px`,
          color: field.fontColor,
          fontFamily: field.fontFace || "sans-serif",
          zIndex: 50,
          cursor: "move"
        }}
        className="font-sans font-bold shadow-sm select-none"
      >
        <div style={{ transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}>
          {children}
        </div>
      </div>
    </Draggable>
  );
}

type CertificateManagementPanelProps = {
  templates: CertificateTemplate[];
  events: AppEvent[];
  volunteers: Volunteer[];
  beneficiaries: Beneficiary[];
  bloodDonors: BloodDonor[];
};

export default function CertificateManagementPanel({
  templates: initialTemplates,
  events,
  volunteers,
  beneficiaries,
  bloodDonors,
}: CertificateManagementPanelProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [view, setView] = useState<"generate" | "manage">("generate");

  // Generator State
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<Set<string>>(new Set());

  // Designer State (shared/hydrated from template)
  const [fields, setFields] = useState<CertificateField[]>([]);
  const [signatures, setSignatures] = useState<{ id: string; url: string; x: number; y: number }[]>([]);

  // Template Maker State
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateAudience, setNewTemplateAudience] = useState<"volunteer" | "beneficiary" | "blood_donor" | "all">("all");
  const [newTemplateImage, setNewTemplateImage] = useState<File | null>(null);
  const [newTemplateImagePreview, setNewTemplateImagePreview] = useState("");
  const [newTemplateEventId, setNewTemplateEventId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const pdfPrintRef = useRef<HTMLDivElement>(null);

  // Sync fields when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setFields(selectedTemplate.fields || []);
      // Signatures aren't stored in DB currently, we might want to keep the local state or default them
    } else {
      setFields([]);
    }
  }, [selectedTemplateId, selectedTemplate]);

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        id: `field_${Date.now()}`,
        label: "New Field",
        x: 50,
        y: 50,
        fontSize: 18,
        fontColor: "#4b302a",
        fontFace: "Arial, sans-serif",
        type: "standard",
        value: "[Name]",
      },
    ]);
  };

  const handleUpdateField = (id: string, updates: Partial<CertificateField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddSignature = async (file: File) => {
    const url = await uploadTemplateImage(file);
    setSignatures(prev => [...prev, { id: `sig_${Date.now()}`, url, x: 85, y: 85 }]);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName || !newTemplateImagePreview) return alert("Name and image required");
    setIsSaving(true);
    try {
      const imageUrl = newTemplateImage ? await uploadTemplateImage(newTemplateImage) : newTemplateImagePreview;
      if (editingTemplateId) {
        const updated = await updateTemplate(editingTemplateId, {
          name: newTemplateName,
          target_audience: newTemplateAudience,
          image_url: imageUrl,
          event_id: newTemplateEventId,
          fields: fields, // Save current design as default
        });
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const newTemplate = await createTemplate({
          name: newTemplateName,
          target_audience: newTemplateAudience,
          image_url: imageUrl,
          event_id: newTemplateEventId,
          fields: fields,
        });
        setTemplates([newTemplate, ...templates]);
      }
      setView("generate");
      resetTemplateForm();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally { setIsSaving(false); }
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setNewTemplateName("");
    setNewTemplateImage(null);
    setNewTemplateImagePreview("");
    setFields([]);
    setSignatures([]);
    setNewTemplateEventId(null);
  };

  const handleEditTemplate = (t: CertificateTemplate) => {
    setEditingTemplateId(t.id);
    setNewTemplateName(t.name);
    setNewTemplateImagePreview(t.image_url);
    setNewTemplateAudience(t.target_audience);
    setNewTemplateEventId(t.event_id || null);
    setFields(t.fields || []);
    setView("manage");
  };

  const getFilteredPeople = () => {
    let list: any[] = [];
    const audience = audienceFilter === "all" ? (selectedTemplate?.target_audience || "all") : audienceFilter;

    if (audience === "all" || audience === "volunteer") {
      volunteers.forEach(v => {
        if (eventFilter === "all" || String(v.eventId) === eventFilter) {
          list.push({ id: `vol_${v.id}`, name: v.fullName, subtext: "Volunteer", eventName: events.find(e => e.id === v.eventId)?.eventName });
        }
      });
    }
    if (audience === "all" || audience === "beneficiary") {
      beneficiaries.forEach(b => {
        if (eventFilter === "all" || String(b.eventId) === eventFilter) {
          list.push({ id: `ben_${b.id}`, name: b.fullName, subtext: "Beneficiary", eventName: events.find(e => e.id === b.eventId)?.eventName });
        }
      });
    }
    if (audience === "all" || audience === "blood_donor") {
      bloodDonors.forEach(d => {
        list.push({ id: `donor_${d.id}`, name: d.donorName, subtext: "Blood Donor", eventName: "Blood Donation" });
      });
    }
    return list;
  };

  const togglePersonSelection = (id: string) => {
    setSelectedPeopleIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    const p = getFilteredPeople();
    if (selectedPeopleIds.size === p.length) setSelectedPeopleIds(new Set());
    else setSelectedPeopleIds(new Set(p.map(x => x.id)));
  };

  const generatePDFs = async (specific?: any[]) => {
    if (!selectedTemplate || !pdfPrintRef.current) return;
    setIsGenerating(true);
    const target = specific || getFilteredPeople().filter(p => selectedPeopleIds.size === 0 || selectedPeopleIds.has(p.id));
    if (target.length === 0) { setIsGenerating(false); return alert("Select recipients"); }

    const pdf = new jsPDF("landscape", "px", "a4");
    const container = pdfPrintRef.current;
    
    for (let i = 0; i < target.length; i++) {
      const person = target[i];
      const tokenId = generateTokenId();
      await recordIssuance({ template_id: selectedTemplate.id, recipient_id: person.id, recipient_name: person.name, event_name: person.eventName || "CEP Event", token_id: tokenId });

      const overlay = container.querySelector("#text-overlay") as HTMLDivElement;
      overlay.innerHTML = "";
      container.querySelectorAll(".sig-print").forEach(s => s.remove());

      fields.forEach(f => {
        const d = document.createElement("div");
        d.style.position = "absolute";
        d.style.left = `${f.x}%`;
        d.style.top = `${f.y}%`;
        d.style.transform = "translate(-50%, -50%)";
        d.style.fontSize = `${f.fontSize * 4}px`; // High res
        d.style.color = f.fontColor;
        d.style.fontFamily = f.fontFace || "sans-serif";
        d.style.fontWeight = "bold";
        d.style.whiteSpace = "nowrap";

        let text = f.value;
        if (f.type === "standard") {
           if (text === "[Name]") text = person.name;
           else if (text === "[Event]") text = person.eventName || "CEP Initiative";
           else if (text === "[Date]") text = new Date().toLocaleDateString();
           else if (text === "[Role]") text = person.subtext;
           else if (text === "[Token]") text = tokenId;
        }
        d.innerText = text;
        overlay.appendChild(d);
      });

      signatures.forEach(s => {
        const img = document.createElement("img");
        img.src = s.url;
        img.className = "sig-print";
        img.style.position = "absolute";
        img.style.left = `${s.x}%`;
        img.style.top = `${s.y}%`;
        img.style.height = "15%";
        img.style.transform = "translate(-50%, -50%)";
        img.crossOrigin = "anonymous";
        container.appendChild(img);
      });

      await new Promise(r => setTimeout(r, 150));
      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    }
    pdf.save(`CEP_Certificates_${Date.now()}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#4b302a] tracking-tight">Certificate Center</h2>
          <p className="text-[#a07464] font-medium">Design once, generate in bulk.</p>
        </div>
        <div className="flex bg-[#fef9f6] p-1 rounded-xl shadow-sm border border-[#f5efec]">
          <button onClick={() => setView("generate")} className={`px-6 py-2 rounded-lg font-bold transition-all ${view === "generate" ? "bg-[#fec288] text-[#4b302a] shadow-md" : "text-[#7a5a4d] hover:bg-white"}`}>Generate</button>
          <button onClick={() => setView("manage")} className={`px-6 py-2 rounded-lg font-bold transition-all ${view === "manage" ? "bg-[#fec288] text-[#4b302a] shadow-md" : "text-[#7a5a4d] hover:bg-white"}`}>Designer</button>
        </div>
      </div>

      {view === "manage" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className={internalCardClassName}>
               <h3 className="text-lg font-bold text-[#4b302a] mb-4">Template Settings</h3>
               <div className="space-y-4">
                  <input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Template Name" className="w-full p-3 rounded-xl border border-[#e0c4ba] bg-white text-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={newTemplateAudience} onChange={(e) => setNewTemplateAudience(e.target.value as any)} className="p-3 rounded-xl border border-[#e0c4ba] bg-white text-sm">
                      <option value="all">Everyone</option>
                      <option value="volunteer">Volunteers</option>
                      <option value="beneficiary">Beneficiaries</option>
                      <option value="blood_donor">Donors</option>
                    </select>
                    <select value={newTemplateEventId || ""} onChange={(e) => setNewTemplateEventId(Number(e.target.value) || null)} className="p-3 rounded-xl border border-[#e0c4ba] bg-white text-sm">
                      <option value="">General (No Event)</option>
                      {events.map(e => <option key={e.id} value={e.id}>{e.eventName}</option>)}
                    </select>
                  </div>
                  <div className="border-2 border-dashed border-[#e0c4ba] rounded-xl p-4 text-center bg-[#fffdf3]">
                    <input type="file" accept="image/*" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setNewTemplateImage(e.target.files[0]);
                        setNewTemplateImagePreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="hidden" id="bg-upload" />
                    <label htmlFor="bg-upload" className="cursor-pointer text-sm font-bold text-[#7a5a4d] hover:text-[#4b302a]">
                      {newTemplateImagePreview ? "Change Background Image" : "Upload Background Image"}
                    </label>
                  </div>
                  <button onClick={handleSaveTemplate} disabled={isSaving} className={`w-full ${internalPrimaryButtonClassName} py-4 text-lg`}>
                    {isSaving ? "Saving..." : "Save Design Template"}
                  </button>
               </div>
            </div>

            <div className={internalCardClassName}>
               <h3 className="text-lg font-bold text-[#4b302a] mb-4">Saved Layouts</h3>
               <div className="space-y-3">
                 {templates.map(t => (
                   <div key={t.id} className="flex items-center justify-between p-3 bg-white border border-[#f5efec] rounded-xl hover:shadow-md transition-shadow">
                     <div>
                        <p className="font-bold text-[#4b302a] text-sm">{t.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black">{t.target_audience}</p>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handleEditTemplate(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                        <button onClick={() => { if(confirm("Delete?")) deleteTemplate(t.id).then(() => setTemplates(p => p.filter(x => x.id !== t.id))) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">Del</button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={internalCardClassName}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#4b302a]">Live Layout Preview</h3>
                <button onClick={handleAddField} className="text-xs bg-[#fec288] px-3 py-1.5 rounded-full font-black text-[#4b302a] shadow-sm">+ Add Field</button>
              </div>
              <div className="relative aspect-[1.414/1] bg-[#fffdf3] border-4 border-dashed border-[#e0c4ba] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                {newTemplateImagePreview ? (
                  <>
                    <img src={newTemplateImagePreview} className="w-full h-full object-contain" alt="Preview" />
                    <div className="absolute inset-0">
                      {fields.map(f => (
                        <DraggableField key={f.id} field={f} onStop={(e, data) => {
                          const container = (data.node as HTMLElement).closest(".absolute.inset-0") as HTMLElement;
                          if (!container) return;
                          const nx = Math.round((f.x * container.clientWidth / 100 + data.x) / container.clientWidth * 100);
                          const ny = Math.round((f.y * container.clientHeight / 100 + data.y) / container.clientHeight * 100);
                          handleUpdateField(f.id, { x: Math.max(0,100, nx), y: Math.max(0,100, ny) });
                        }}>{f.value}</DraggableField>
                      ))}
                    </div>
                  </>
                ) : <p className="text-gray-300 font-bold">Upload a background to start mapping</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "generate" && (
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1 space-y-6">
            <div className={internalCardClassName}>
               <h3 className="text-sm font-black text-[#4b302a] uppercase mb-4">1. Select Template</h3>
               <div className="space-y-3">
                 <select value={eventFilter} onChange={(e) => { setEventFilter(e.target.value); setSelectedTemplateId(""); }} className="w-full p-2.5 rounded-xl border border-[#e0c4ba] text-xs font-bold">
                    <option value="all">Any Event</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.eventName}</option>)}
                 </select>
                 <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#e0c4ba] text-xs font-bold bg-[#fffdf3]">
                    <option value="">-- Choose Layout --</option>
                    {templates.filter(t => !t.event_id || String(t.event_id) === eventFilter || eventFilter === "all").map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                 </select>
               </div>
            </div>

            {selectedTemplate && (
              <div className={internalCardClassName}>
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-black text-[#4b302a] uppercase">2. Designer Tools</h3>
                   <button onClick={handleAddField} className="text-[10px] bg-white border border-[#e0c4ba] px-2 py-1 rounded-lg font-bold">+ Field</button>
                 </div>
                 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                   {fields.map(f => (
                     <div key={f.id} className="p-2.5 border rounded-xl bg-gray-50 relative group">
                        <button onClick={() => handleRemoveField(f.id)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] items-center justify-center hidden group-hover:flex">×</button>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                           <input type="text" value={f.label} onChange={(e) => handleUpdateField(f.id,{label:e.target.value})} className="col-span-2 text-[10px] p-1 border rounded" />
                           <div className="flex items-center gap-1 bg-white p-1 rounded border text-[9px]">X: <input type="number" value={f.x} onChange={(e) => handleUpdateField(f.id, {x: Number(e.target.value)})} className="w-full outline-none font-bold text-blue-600" />%</div>
                           <div className="flex items-center gap-1 bg-white p-1 rounded border text-[9px]">Y: <input type="number" value={f.y} onChange={(e) => handleUpdateField(f.id, {y: Number(e.target.value)})} className="w-full outline-none font-bold text-blue-600" />%</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="number" value={f.fontSize} onChange={(e) => handleUpdateField(f.id,{fontSize:Number(e.target.value)})} className="w-10 border rounded text-[10px] p-1" />
                          <input type="color" value={f.fontColor} onChange={(e) => handleUpdateField(f.id,{fontColor:e.target.value})} className="w-6 h-6 p-0.5 border rounded" />
                          <select value={f.fontFace} onChange={(e) => handleUpdateField(f.id, {fontFace: e.target.value})} className="text-[9px] border rounded grow p-1">
                            <option value="sans-serif">Arial</option>
                            <option value="serif">Times</option>
                            <option value="cursive">Script</option>
                          </select>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
            
            {selectedTemplate && (
              <button onClick={() => generatePDFs()} disabled={isGenerating} className={`w-full ${internalPrimaryButtonClassName} py-4 shadow-xl`}>
                {isGenerating ? "Working..." : "Start Batch Generation"}
              </button>
            )}
          </div>

          <div className="lg:col-span-3 space-y-6">
            {selectedTemplate ? (
              <>
                <div className="relative w-full border rounded-2xl bg-white overflow-hidden shadow-2xl ring-1 ring-black/5 aspect-[1.414/1]">
                   <img src={selectedTemplate.image_url} className="w-full h-full object-contain" alt="Preview" />
                   <div className="absolute inset-0">
                      {fields.map(f => (
                         <DraggableField key={f.id} field={f} onStop={(e, data) => {
                            const c = (data.node as HTMLElement).closest(".absolute.inset-0") as HTMLElement;
                            if (!c) return;
                            const nx = Math.round((f.x * c.clientWidth / 100 + data.x) / c.clientWidth * 100);
                            const ny = Math.round((f.y * c.clientHeight / 100 + data.y) / c.clientHeight * 100);
                            handleUpdateField(f.id, { x: Math.max(0, Math.min(100, nx)), y: Math.max(0, Math.min(100, ny)) });
                         }}>
                           {f.value === "[Name]" ? "Preview Name" : f.value}
                         </DraggableField>
                      ))}
                      {signatures.map(s => (
                        <DraggableField key={s.id} field={{...fields[0], id: s.id, x: s.x, y:s.y, fontSize: 0, fontColor: '', fontFace: '', type: 'custom', value: ''}} onStop={(e, data) => {
                           const c = (data.node as HTMLElement).closest(".absolute.inset-0") as HTMLElement;
                           if (!c) return;
                           const nx = Math.round((s.x * c.clientWidth / 100 + data.x) / c.clientWidth * 100);
                           const ny = Math.round((s.y * c.clientHeight / 100 + data.y) / c.clientHeight * 100);
                           setSignatures(prev => prev.map(x => x.id === s.id ? {...x, x: Math.max(0,100,nx), y:Math.max(0,100,ny)} : x));
                        }}>
                          <img src={s.url} className="h-12 border border-blue-200 bg-white/50 p-1 rounded" alt="S" />
                        </DraggableField>
                      ))}
                   </div>
                   <div className="absolute bottom-4 right-4">
                      <label className="bg-white/80 backdrop-blur py-2 px-4 rounded-full text-xs font-black shadow-lg cursor-pointer flex items-center gap-2 hover:bg-white border">
                        🖋️ Add Signature
                        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAddSignature(e.target.files[0])} className="hidden" />
                      </label>
                   </div>
                </div>

                <div className={internalCardClassName}>
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="font-black text-[#4b302a] uppercase text-sm">3. Recipients Selection</h4>
                     <button onClick={toggleSelectAll} className="text-xs text-blue-600 font-bold border-b border-blue-200">Toggle {getFilteredPeople().length}</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                     {getFilteredPeople().map(p => (
                       <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedPeopleIds.has(p.id) ? "bg-[#fff8e8] border-[#fec288] shadow-sm" : "bg-white hover:bg-gray-50 border-gray-100"}`}>
                         <input type="checkbox" checked={selectedPeopleIds.has(p.id)} onChange={() => togglePersonSelection(p.id)} className="rounded text-[#fec288]" />
                         <div className="overflow-hidden">
                           <p className="text-sm font-bold truncate">{p.name}</p>
                           <p className="text-[9px] text-[#a07464] font-black uppercase truncate">{p.subtext}</p>
                         </div>
                       </label>
                     ))}
                   </div>
                </div>
              </>
            ) : (
              <div className="h-[500px] bg-white border border-[#f5efec] rounded-3xl flex flex-col items-center justify-center text-gray-300 gap-4">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl">📜</div>
                 <p className="font-black text-sm uppercase tracking-widest">Select a template to design</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden high-res container */}
      <div style={{ position: "fixed", top: "-9999px", left: 0, width: "1122px", backgroundColor: "#fff" }}>
        <div ref={pdfPrintRef} style={{ position: "relative", width: "100%" }}>
          {selectedTemplate && (
            <>
              <img src={selectedTemplate.image_url} style={{ width: "100%", display: "block" }} crossOrigin="anonymous" />
              <div id="text-overlay" style={{ position: "absolute", inset: 0 }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
