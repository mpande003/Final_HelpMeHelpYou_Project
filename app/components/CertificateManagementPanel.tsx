"use client";

import { useState, useRef, ReactNode } from "react";
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

// DraggableField helper to avoid findDOMNode errors in modern React
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
          transform: "translate(-50%, -50%)",
          fontSize: `${field.fontSize}px`,
          color: field.fontColor,
          whiteSpace: "nowrap",
          cursor: "move",
          zIndex: 50
        }}
        className="font-sans font-bold shadow-sm select-none"
      >
        {children}
      </div>
    </Draggable>
  );
}

type PublicSiteShellProps = {
  activePath: "/" | "/about" | "/contact" | "/donate" | "/impact" | "/volunteer" | "/verify" | "/admin" | "/admin/certificates";
  children: React.ReactNode;
};

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
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [scaleMode, setScaleMode] = useState<"fit" | "actual" | "shrink" | "custom">("actual");
  const [customScale, setCustomScale] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<Set<string>>(new Set());

  // Template Maker State
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateAudience, setNewTemplateAudience] = useState<"volunteer" | "beneficiary" | "blood_donor" | "all">("all");
  const [newTemplateImage, setNewTemplateImage] = useState<File | null>(null);
  const [newTemplateImagePreview, setNewTemplateImagePreview] = useState("");
  const [fields, setFields] = useState<CertificateField[]>([]);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureX, setSignatureX] = useState(85);
  const [signatureY, setSignatureY] = useState(85);
  const [isSaving, setIsSaving] = useState(false);

  const pdfPrintRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        id: `field_${Date.now()}`,
        label: "New Field",
        x: 50,
        y: 50,
        fontSize: 24,
        fontColor: "#000000",
        type: "standard",
        value: "[Preset]",
      },
    ]);
  };

  const handleUpdateField = (id: string, updates: Partial<CertificateField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewTemplateImage(file);
      setNewTemplateImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName || !newTemplateImagePreview) return alert("Name and image required");
    setIsSaving(true);
    try {
      let imageUrl = newTemplateImagePreview;
      if (newTemplateImage) {
        imageUrl = await uploadTemplateImage(newTemplateImage);
      }

      if (editingTemplateId) {
        const updated = await updateTemplate(editingTemplateId, {
          name: newTemplateName,
          target_audience: newTemplateAudience,
          image_url: imageUrl,
          fields,
          signature_url: signatureUrl || undefined,
          signature_x: signatureX,
          signature_y: signatureY
        });
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const newTemplate = await createTemplate({
          name: newTemplateName,
          target_audience: newTemplateAudience,
          image_url: imageUrl,
          fields,
          signature_url: signatureUrl || undefined,
          signature_x: signatureX,
          signature_y: signatureY
        });
        setTemplates([newTemplate, ...templates]);
      }

      setView("generate");
      resetTemplateForm();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to save template: ${e.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setNewTemplateName("");
    setNewTemplateImage(null);
    setNewTemplateImagePreview("");
    setFields([]);
    setSignatureUrl(null);
    setSignatureX(85);
    setSignatureY(85);
  };

  const handleEditTemplate = (template: CertificateTemplate) => {
    setEditingTemplateId(template.id);
    setNewTemplateName(template.name);
    setNewTemplateImagePreview(template.image_url);
    setNewTemplateAudience(template.target_audience);
    setFields(template.fields || []);
    setSignatureUrl(template.signature_url || null);
    setSignatureX(template.signature_x || 85);
    setSignatureY(template.signature_y || 85);
    setView("manage");
  };

  const handleDuplicateTemplate = async (template: CertificateTemplate) => {
    try {
      const duplicated = await createTemplate({
        name: `${template.name} (Copy)`,
        target_audience: template.target_audience,
        image_url: template.image_url,
        fields: template.fields || [],
        signature_url: template.signature_url,
        signature_x: template.signature_x,
        signature_y: template.signature_y
      });
      setTemplates([duplicated, ...templates]);
    } catch (error: any) {
      alert(`Failed to duplicate template: ${error.message || "Unknown error"}`);
    }
  };

  const togglePersonSelection = (id: string) => {
    setSelectedPeopleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const people = getFilteredPeople();
    if (selectedPeopleIds.size === people.length) {
      setSelectedPeopleIds(new Set());
    } else {
      setSelectedPeopleIds(new Set(people.map((p) => p.id)));
    }
  };

  const getFilteredPeople = () => {
    let people: { id: string; name: string; eventName?: string; subtext?: string }[] = [];

    const effectiveAudience =
      audienceFilter !== "all"
        ? audienceFilter
        : selectedTemplate && selectedTemplate.target_audience !== "all"
        ? selectedTemplate.target_audience
        : "all";

    if (effectiveAudience === "volunteer" || effectiveAudience === "all") {
      volunteers.forEach((v) => {
        if (eventFilter !== "all" && String(v.eventId) !== eventFilter) return;
        const e = events.find((ev) => ev.id === v.eventId);
        people.push({ id: `vol_${v.id}`, name: v.fullName, eventName: e?.eventName, subtext: "Volunteer" });
      });
    }

    if (effectiveAudience === "beneficiary" || effectiveAudience === "all") {
      beneficiaries.forEach((b) => {
        if (eventFilter !== "all" && String(b.eventId) !== eventFilter) return;
        const e = events.find((ev) => ev.id === b.eventId);
        people.push({ id: `ben_${b.id}`, name: b.fullName, eventName: e?.eventName, subtext: "Beneficiary" });
      });
    }

    if (effectiveAudience === "blood_donor" || effectiveAudience === "all") {
      bloodDonors.forEach((d) => {
        people.push({ id: `donor_${d.id}`, name: d.donorName, eventName: "Blood Donation", subtext: "Donor" });
      });
    }

    return people;
  };

  const generatePDFs = async (specificPeople?: any[]) => {
    if (!selectedTemplate || !pdfPrintRef.current) return;
    setIsGenerating(true);

    const people = specificPeople || getFilteredPeople().filter(p => selectedPeopleIds.size === 0 || selectedPeopleIds.has(p.id));
    
    if (people.length === 0) {
      alert("No people selected.");
      setIsGenerating(false);
      return;
    }

    try {
      const pdf = new jsPDF("landscape", "px", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < people.length; i++) {
        const person = people[i];
        const tokenId = generateTokenId();
        
        // Record issuance (Don't await to speed up bulk generation, though maybe safer to await)
        try {
          await recordIssuance({
            template_id: selectedTemplate.id,
            recipient_id: person.id,
            recipient_name: person.name,
            event_name: person.eventName || "General NGO Initiative",
            token_id: tokenId
          });
        } catch (e) {
          console.error("Failed to record issuance:", e);
        }

        // Temporarily render person's details in the hidden ref
        const container = pdfPrintRef.current;
        const textOverlay = container.querySelector("#text-overlay") as HTMLDivElement;
        textOverlay.innerHTML = ""; // Clear
        
        (selectedTemplate.fields || []).forEach((field) => {
          const el = document.createElement("div");
          el.style.position = "absolute";
          el.style.left = `${field.x}%`;
          el.style.top = `${field.y}%`;
          el.style.transform = `translate(-50%, -50%)`;
          el.style.fontSize = `${field.fontSize}px`;
          el.style.color = field.fontColor;
          el.style.fontFamily = "sans-serif";
          el.style.whiteSpace = "nowrap";
          el.style.fontWeight = "bold";

          let textValue = field.value || "";
          
          if (field.type === "standard") {
            if (field.value === "[Name]") textValue = person.name;
            else if (field.value === "[Event]") textValue = person.eventName || "General Contribution";
            else if (field.value === "[Date]") textValue = new Date().toLocaleDateString();
            else if (field.value === "[Role]") textValue = person.subtext || "";
            else if (field.value === "[Token]") textValue = tokenId;
          } else {
             textValue = customInputs[field.id] || field.value || "";
          }

          el.innerText = textValue;
          textOverlay.appendChild(el);
        });

        // Update signature in hidden ref
        const sigImg = container.querySelector("#signature-img") as HTMLImageElement;
        if (sigImg) {
          if (selectedTemplate.signature_url) {
            sigImg.src = selectedTemplate.signature_url;
            sigImg.style.display = "block";
            sigImg.style.left = `${selectedTemplate.signature_x || 85}%`;
            sigImg.style.top = `${selectedTemplate.signature_y || 85}%`;
            sigImg.style.transform = "translate(-50%, -50%)"; // Center it
          } else {
            sigImg.style.display = "none";
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        
        let drawWidth = pdfWidth;
        const canvasRatio = canvas.height / canvas.width;
        let drawHeight = pdfWidth * canvasRatio;

        if (scaleMode === "custom") {
          const scaleFactor = customScale / 100;
          drawWidth *= scaleFactor;
          drawHeight *= scaleFactor;
        } else if (scaleMode === "shrink" && drawHeight > pdfHeight) {
          const ratio = pdfHeight / drawHeight;
          drawWidth *= ratio;
          drawHeight *= ratio;
        }
        
        let startX = (pdfWidth - drawWidth) / 2;
        let startY = (pdfHeight - drawHeight) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", startX, startY, drawWidth, drawHeight);
      }

      pdf.save(`Certificates_${selectedTemplate.name}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#4b302a]">Certificate Generation</h2>
          <p className="text-sm text-[#7a5a4d]">Design templates and print certificates.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("generate")}
            className={view === "generate" ? internalPrimaryButtonClassName : internalSecondaryButtonClassName}
          >
            Generate
          </button>
          <button
            onClick={() => setView("manage")}
            className={view === "manage" ? internalPrimaryButtonClassName : internalSecondaryButtonClassName}
          >
            Manage Templates
          </button>
        </div>
      </div>

      {view === "manage" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={internalCardClassName}>
            <h3 className="text-lg font-semibold text-[#4b302a] flex items-center justify-between">
              Create Template Map
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4b302a]">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-[#e0c4ba] p-2 bg-[#fffdf3]"
                  placeholder="e.g. Annual Event Volunteer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#4b302a]">Background Image (Landscape)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-[#7a5a4d] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#fec288] file:text-[#4b302a] hover:file:bg-[#fca566]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4b302a]">Target Audience Default</label>
                <select
                  value={newTemplateAudience}
                  onChange={(e) => setNewTemplateAudience(e.target.value as any)}
                  className="mt-1 block w-full rounded-md border border-[#e0c4ba] p-2 bg-[#fffdf3]"
                >
                  <option value="all">All</option>
                  <option value="volunteer">Volunteers</option>
                  <option value="beneficiary">Beneficiaries</option>
                  <option value="blood_donor">Blood Donors</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#e0c4ba]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#4b302a]">Dynamic Fields</h4>
                  <button onClick={handleAddField} className="text-xs bg-[#fec288] px-2 py-1 rounded text-[#4b302a]">
                    + Add Field
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {fields.map((f, i) => (
                    <div key={f.id} className="p-3 border border-[#e0c4ba] rounded-lg bg-white space-y-3 relative">
                      <button 
                        onClick={() => handleRemoveField(f.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#4b302a]">Label (For UI)</label>
                          <input
                            type="text"
                            value={f.label}
                            onChange={(e) => handleUpdateField(f.id, { label: e.target.value })}
                            className="w-full text-sm rounded border border-[#e0c4ba] p-1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4b302a]">Field Type</label>
                          <select
                            value={f.type}
                            onChange={(e) => handleUpdateField(f.id, { type: e.target.value as "standard" | "custom", value: e.target.value === "standard" ? "[Name]" : "Custom Text" })}
                            className="w-full text-sm rounded border border-[#e0c4ba] p-1"
                          >
                            <option value="standard">Standard Data</option>
                            <option value="custom">Custom Input</option>
                          </select>
                        </div>
                      </div>

                      {f.type === "standard" ? (
                        <div>
                           <label className="block text-xs font-medium text-[#4b302a]">Data Point</label>
                           <select
                            value={f.value}
                            onChange={(e) => handleUpdateField(f.id, { value: e.target.value })}
                            className="w-full text-sm rounded border border-[#e0c4ba] p-1"
                          >
                            <option value="[Name]">Person's Name</option>
                            <option value="[Event]">Event Name</option>
                            <option value="[Date]">Current Date</option>
                            <option value="[Role]">Role (e.g. Volunteer)</option>
                            <option value="[Token]">Verification Token</option>
                          </select>
                        </div>
                      ) : (
                         <div>
                          <label className="block text-xs font-medium text-[#4b302a]">Default Value</label>
                          <input
                            type="text"
                            value={f.value}
                            onChange={(e) => handleUpdateField(f.id, { value: e.target.value })}
                            className="w-full text-sm rounded border border-[#e0c4ba] p-1"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                           <label className="block text-xs text-[#7a5a4d]">X (%)</label>
                           <input type="number" value={f.x} onChange={(e) => handleUpdateField(f.id, { x: Number(e.target.value) })} className="w-full text-sm border p-1 rounded" />
                        </div>
                        <div>
                           <label className="block text-xs text-[#7a5a4d]">Y (%)</label>
                           <input type="number" value={f.y} onChange={(e) => handleUpdateField(f.id, { y: Number(e.target.value) })} className="w-full text-sm border p-1 rounded" />
                        </div>
                        <div>
                           <label className="block text-xs text-[#7a5a4d]">Size</label>
                           <input type="number" value={f.fontSize} onChange={(e) => handleUpdateField(f.id, { fontSize: Number(e.target.value) })} className="w-full text-sm border p-1 rounded" />
                        </div>
                         <div>
                           <label className="block text-xs text-[#7a5a4d]">Color</label>
                           <input type="color" value={f.fontColor} onChange={(e) => handleUpdateField(f.id, { fontColor: e.target.value })} className="w-full h-7 border rounded p-0 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && <p className="text-sm text-gray-500 italic">No fields added. Click Add Field above.</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-[#e0c4ba]">
                <label className="block text-sm font-medium text-[#4b302a] mb-2">Signature Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {signatureUrl && <img src={signatureUrl} className="h-10 border rounded bg-white" alt="Sig" />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const url = await uploadTemplateImage(e.target.files[0]);
                        setSignatureUrl(url);
                      }
                    }}
                    className="text-xs"
                  />
                  {signatureUrl && (
                    <button onClick={() => setSignatureUrl(null)} className="text-xs text-red-500">Remove</button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveTemplate}
                  disabled={isSaving}
                  className={`flex-1 ${internalPrimaryButtonClassName}`}
                >
                  {isSaving ? "Saving..." : editingTemplateId ? "Update Template" : "Save Template"}
                </button>
                {editingTemplateId && (
                  <button
                    onClick={resetTemplateForm}
                    className={`flex-1 ${internalSecondaryButtonClassName}`}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className={internalCardClassName}>
                <h3 className="text-lg font-semibold text-[#4b302a] mb-4">Saved Templates</h3>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#e0c4ba] text-[#7a5a4d]">
                         <tr>
                            <th className="pb-2 font-semibold">Name</th>
                            <th className="pb-2 font-semibold">Audience</th>
                            <th className="pb-2 font-semibold">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5efec]">
                         {templates.map(t => (
                            <tr key={t.id} className="group hover:bg-[#fffdfa]">
                               <td className="py-3 font-medium text-[#4b302a]">{t.name}</td>
                               <td className="py-3 text-[#7a5a4d] underline decoration-dotted capitalize">{t.target_audience}</td>
                               <td className="py-3">
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => handleEditTemplate(t)} className="text-blue-600 hover:text-blue-800">Edit</button>
                                     <button onClick={() => handleDuplicateTemplate(t)} className="text-green-600 hover:text-green-800">Duplicate</button>
                                     <button onClick={() => { if(confirm("Delete this template?")) deleteTemplate(t.id).then(() => setTemplates(prev => prev.filter(p => p.id !== t.id))) }} className="text-red-600 hover:text-red-800">Delete</button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                   {templates.length === 0 && <p className="text-center py-8 text-[#7a5a4d] italic">No templates created yet.</p>}
                </div>
             </div>

             <div className={internalCardClassName}>
               <h3 className="text-lg font-semibold text-[#4b302a]">Live Preview</h3>
               <p className="text-xs text-[#7a5a4d] mb-4">Drag fields on the preview or use X/Y inputs to position them.</p>
               
               <div className="relative border-4 border-dashed border-[#e0c4ba] bg-[#fffdf3] w-full rounded flex items-center justify-center overflow-hidden">
                 {newTemplateImagePreview ? (
                   <>
                     <img src={newTemplateImagePreview} className="w-full h-auto block" alt="Template BG" />
                     <div className="absolute inset-0">
                       {fields.map(f => (
                         <DraggableField
                            key={f.id}
                            field={f}
                            onStop={(e, data) => {
                               // Convert pixel movement to percentage
                               const container = (e.currentTarget as HTMLElement).closest(".absolute.inset-0") as HTMLElement;
                               if (!container) return;
                               const newX = Math.round((f.x * container.clientWidth / 100 + data.x) / container.clientWidth * 100);
                               const newY = Math.round((f.y * container.clientHeight / 100 + data.y) / container.clientHeight * 100);
                               handleUpdateField(f.id, { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
                            }}
                         >
                            {f.value === "[Name]" ? "John Doe" : f.value === "[Event]" ? "Annual Gala" : f.value === "[Date]" ? "01/01/2026" : f.value === "[Role]" ? "Volunteer" : f.value === "[Token]" ? "CEP-ABCD-1234" : (f.value || "Custom")}
                         </DraggableField>
                       ))}
                       {signatureUrl && (
                          <DraggableField
                            field={{ id: 'sig', label: 'Signature', x: signatureX, y: signatureY, fontSize: 0, fontColor: '', type: 'custom', value: '' }}
                            onStop={(e, data) => {
                               const container = (e.currentTarget as HTMLElement).closest(".absolute.inset-0") as HTMLElement;
                               if (!container) return;
                               const newX = Math.round((signatureX * container.clientWidth / 100 + data.x) / container.clientWidth * 100);
                               const newY = Math.round((signatureY * container.clientHeight / 100 + data.y) / container.clientHeight * 100);
                               setSignatureX(Math.max(0, Math.min(100, newX)));
                               setSignatureY(Math.max(0, Math.min(100, newY)));
                            }}
                          >
                             <div className="pointer-events-none opacity-80 flex flex-col items-center">
                               <img src={signatureUrl} className="h-12" alt="Signature" />
                               <p className="text-[8px] text-center uppercase tracking-tighter text-gray-500">Authorized Signature</p>
                             </div>
                          </DraggableField>
                       )}
                     </div>
                   </>
                 ) : (
                   <div className="py-20 text-gray-400">Upload image to see preview</div>
                 )}
               </div>
             </div>
          </div>
        </div>
      )}

      {view === "generate" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`lg:col-span-1 ${internalCardClassName}`}>
            <h3 className="text-lg font-semibold text-[#4b302a] mb-4">Configure Output</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4b302a]">Select Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-[#e0c4ba] p-2 bg-[#fffdf3]"
                >
                  <option value="">-- Choose a saved template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.target_audience})</option>
                  ))}
                </select>
              </div>

              {selectedTemplate && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#4b302a]">Filter Audience</label>
                    <select
                      value={audienceFilter}
                      onChange={(e) => setAudienceFilter(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-[#e0c4ba] p-2 bg-[#fffdf3]"
                    >
                      <option value="all">Everyone</option>
                      <option value="volunteer">Volunteers</option>
                      <option value="beneficiary">Beneficiaries</option>
                      <option value="blood_donor">Blood Donors</option>
                    </select>
                  </div>

                  {audienceFilter !== "blood_donor" && (
                     <div>
                      <label className="block text-sm font-medium text-[#4b302a]">Filter by Event</label>
                      <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-[#e0c4ba] p-2 bg-[#fffdf3]"
                      >
                        <option value="all">All Events</option>
                        {events.map((e) => (
                           <option key={e.id} value={String(e.id)}>{e.eventName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Render inputs for any Custom fields */}
                  {(selectedTemplate.fields || []).filter(f => f.type === "custom").length > 0 && (
                    <div className="pt-4 border-t border-[#e0c4ba] space-y-3">
                      <h4 className="text-sm font-semibold text-[#4b302a]">Custom Template Fields</h4>
                      {(selectedTemplate.fields || []).filter(f => f.type === "custom").map(f => (
                         <div key={f.id}>
                            <label className="block text-xs font-medium text-[#7a5a4d]">{f.label}</label>
                            <input
                              type="text"
                              placeholder={f.value}
                              onChange={(e) => setCustomInputs(prev => ({...prev, [f.id]: e.target.value}))}
                              className="mt-1 block w-full rounded border border-[#e0c4ba] p-1.5 text-sm bg-white"
                            />
                         </div>
                      ))}
                    </div>
                  )}

                  {/* Print Scaling Options */}
                  <div className="pt-4 border-t border-[#e0c4ba]">
                    <h4 className="text-sm font-semibold text-[#4b302a] mb-3">Page Scaling</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-[#4b302a]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="scaleMode" 
                          value="fit" 
                          checked={scaleMode === "fit"} 
                          onChange={() => setScaleMode("fit")} 
                          className="accent-[#0066cc]"
                        />
                        Fit
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="scaleMode" 
                          value="actual" 
                          checked={scaleMode === "actual"} 
                          onChange={() => setScaleMode("actual")} 
                          className="accent-[#0066cc]"
                        />
                        Actual size
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="scaleMode" 
                          value="shrink" 
                          checked={scaleMode === "shrink"} 
                          onChange={() => setScaleMode("shrink")} 
                          className="accent-[#0066cc]"
                        />
                        Shrink oversized pages
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="scaleMode" 
                          value="custom" 
                          checked={scaleMode === "custom"} 
                          onChange={() => setScaleMode("custom")} 
                          className="accent-[#0066cc]"
                        />
                        Custom Scale:
                        <input 
                          type="number" 
                          value={customScale} 
                          onChange={(e) => {
                            setCustomScale(Number(e.target.value));
                            setScaleMode("custom");
                          }}
                          className="w-16 ml-1 p-0.5 border rounded"
                        /> %
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e0c4ba]">
                     <p className="text-sm text-[#7a5a4d] mb-4">
                       Ready to generate for {selectedPeopleIds.size || getFilteredPeople().length} individual(s).
                     </p>
                     <button
                        onClick={() => generatePDFs()}
                        disabled={isGenerating || (selectedPeopleIds.size === 0 && getFilteredPeople().length === 0)}
                        className={`w-full ${internalPrimaryButtonClassName}`}
                      >
                        {isGenerating ? "Processing..." : "Generate PDF Batch"}
                      </button>
                    </div>
                </>
              )}
            </div>
          </div>

          <div className={`lg:col-span-2 ${internalCardClassName}`}>
            {selectedTemplate ? (
              <div className="space-y-6">
                <div className="relative w-full border rounded bg-[#fffdf3] overflow-hidden shadow-sm">
                   <img src={selectedTemplate.image_url} className="w-full h-auto block opacity-80" alt="Preview Background" />
                   <div className="absolute inset-0">
                     {(selectedTemplate.fields || []).map(f => (
                        <div 
                          key={f.id}
                          style={{
                            position: "absolute",
                            left: `${f.x}%`,
                            top: `${f.y}%`,
                            transform: "translate(-50%, -50%)",
                            fontSize: `${f.fontSize}px`,
                            color: f.fontColor,
                            whiteSpace: "nowrap"
                          }}
                          className="font-sans font-bold"
                        >
                          {f.type === "standard" 
                            ? (f.value === "[Name]" ? "{Name}" : f.value === "[Event]" ? "{Event}" : f.value === "[Date]" ? "{Date}" : f.value === "[Token]" ? "{Token}" : "{Role}") 
                            : (customInputs[f.id] || f.value || "{Custom}")}
                        </div>
                      ))}
                      {selectedTemplate.signature_url && (
                        <div 
                          className="absolute pointer-events-none opacity-70 flex flex-col items-center"
                          style={{
                            left: `${selectedTemplate.signature_x || 85}%`,
                            top: `${selectedTemplate.signature_y || 85}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                           <img src={selectedTemplate.signature_url} className="h-10" alt="Signature" />
                           <p className="text-[6px] text-center uppercase tracking-tighter text-gray-400">Authorized Signature</p>
                        </div>
                      )}
                   </div>
                </div>

                <div className={internalCardClassName}>
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-[#4b302a]">Select Recipients</h4>
                      <button onClick={toggleSelectAll} className="text-xs text-[#0066cc] font-medium hover:underline">
                         {selectedPeopleIds.size === getFilteredPeople().length ? "Deselect All" : "Select All Visible"}
                      </button>
                   </div>
                   
                   <div className="max-h-[300px] overflow-y-auto border border-[#f5efec] rounded-lg divide-y divide-[#f5efec]">
                      {getFilteredPeople().map(p => (
                         <div key={p.id} className="flex items-center justify-between p-3 hover:bg-[#fffdfa] text-sm">
                            <div className="flex items-center gap-3">
                               <input 
                                  type="checkbox" 
                                  checked={selectedPeopleIds.has(p.id)} 
                                  onChange={() => togglePersonSelection(p.id)}
                                  className="rounded border-[#e0c4ba]"
                                />
                               <div>
                                  <p className="font-medium text-[#4b302a]">{p.name}</p>
                                  <p className="text-[10px] text-[#7a5a4d] uppercase tracking-wider">{p.subtext} • {p.eventName || "General"}</p>
                               </div>
                            </div>
                            <button 
                               onClick={() => generatePDFs([p])}
                               disabled={isGenerating}
                               className="text-xs text-[#4b302a] bg-[#fff8e8] border border-[#fec288] px-3 py-1 rounded hover:bg-[#fec288] transition-colors"
                            >
                               Download
                            </button>
                         </div>
                      ))}
                      {getFilteredPeople().length === 0 && <p className="p-8 text-center italic text-[#7a5a4d]">No people match the current filters.</p>}
                   </div>
                </div>
              </div>
            ) : (
               <div className="h-full flex items-center justify-center text-[#7a5a4d]">
                 Select a template to view the preview
               </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden print container for high-res PDF rendering */}
      <div 
        style={{ 
          position: "fixed", 
          top: "-9999px", 
          left: 0, 
          width: "1122px", // Fix width (approx A4 96dpi) for consistent font scale, height adjusts naturally
          backgroundColor: "#ffffff",
          overflow: "hidden"
        }}
      >
        <div ref={pdfPrintRef} style={{ position: "relative", width: "100%", backgroundColor: "#ffffff" }}>
          {selectedTemplate && (
            <>
              <img src={selectedTemplate.image_url} style={{ width: "100%", height: "auto", display: "block" }} crossOrigin="anonymous" />
              <img id="signature-img" style={{ position: "absolute", height: "15%", display: "none" }} crossOrigin="anonymous" />
              <div id="text-overlay" style={{ position: "absolute", inset: 0 }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
