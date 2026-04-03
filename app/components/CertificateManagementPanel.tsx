"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { AppEvent } from "@/lib/events";
import type { Volunteer } from "@/lib/volunteers";
import type { Beneficiary } from "@/lib/beneficiaries";
import type { BloodDonor } from "@/lib/blood";
import type { CertificateTemplate, CertificateField } from "@/lib/certificates";
import { createTemplate, uploadTemplateImage, deleteTemplate } from "@/lib/certificates";
import {
  internalCardClassName,
  internalPrimaryButtonClassName,
  internalSecondaryButtonClassName,
} from "./internalTheme";

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

  // Template Maker State
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateAudience, setNewTemplateAudience] = useState<"volunteer" | "beneficiary" | "blood_donor" | "all">("all");
  const [newTemplateImage, setNewTemplateImage] = useState<File | null>(null);
  const [newTemplateImagePreview, setNewTemplateImagePreview] = useState("");
  const [fields, setFields] = useState<CertificateField[]>([]);
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
    if (!newTemplateName || !newTemplateImage) return alert("Name and image required");
    setIsSaving(true);
    try {
      const imageUrl = await uploadTemplateImage(newTemplateImage);
      const newTemplate = await createTemplate({
        name: newTemplateName,
        target_audience: newTemplateAudience,
        image_url: imageUrl,
        fields,
      });
      setTemplates([newTemplate, ...templates]);
      setView("generate");
      setNewTemplateName("");
      setNewTemplateImage(null);
      setNewTemplateImagePreview("");
      setFields([]);
    } catch (e) {
      console.error(e);
      alert("Failed to save template.");
    } finally {
      setIsSaving(false);
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
        people.push({ id: `vol_${v.id}`, name: v.fullName, eventName: e?.event_name, subtext: "Volunteer" });
      });
    }

    if (effectiveAudience === "beneficiary" || effectiveAudience === "all") {
      beneficiaries.forEach((b) => {
        if (eventFilter !== "all" && String(b.eventId) !== eventFilter) return;
        const e = events.find((ev) => ev.id === b.eventId);
        people.push({ id: `ben_${b.id}`, name: b.fullName, eventName: e?.event_name, subtext: "Beneficiary" });
      });
    }

    if (effectiveAudience === "blood_donor" || effectiveAudience === "all") {
      bloodDonors.forEach((d) => {
        people.push({ id: `donor_${d.id}`, name: d.fullName, eventName: "Blood Donation", subtext: "Donor" });
      });
    }

    return people;
  };

  const generatePDFs = async () => {
    if (!selectedTemplate || !pdfPrintRef.current) return;
    setIsGenerating(true);

    const people = getFilteredPeople();
    if (people.length === 0) {
      alert("No people matched the filter criteria.");
      setIsGenerating(false);
      return;
    }

    try {
      const pdf = new jsPDF("landscape", "px", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < people.length; i++) {
        const person = people[i];
        
        // Temporarily render person's details in the hidden ref
        const container = pdfPrintRef.current;
        const img = container.querySelector("img") as HTMLImageElement;
        
        // Set up the fields inside the container
        const textOverlay = container.querySelector("#text-overlay") as HTMLDivElement;
        textOverlay.innerHTML = ""; // Clear
        
        selectedTemplate.fields.forEach((field) => {
          const el = document.createElement("div");
          el.style.position = "absolute";
          el.style.left = `${field.x}%`;
          el.style.top = `${field.y}%`;
          el.style.transform = `translate(-50%, -50%)`;
          el.style.fontSize = `${field.fontSize}px`;
          el.style.color = field.fontColor;
          el.style.fontFamily = "sans-serif";
          el.style.whiteSpace = "nowrap";

          let textValue = field.value || "";
          
          if (field.type === "standard") {
            if (field.value === "[Name]") textValue = person.name;
            else if (field.value === "[Event]") textValue = person.eventName || "General Contribution";
            else if (field.value === "[Date]") textValue = new Date().toLocaleDateString();
            else if (field.value === "[Role]") textValue = person.subtext || "";
          } else {
             // Use custom input if provided, else fallback to field.value
             textValue = customInputs[field.id] || field.value || "";
          }

          el.innerText = textValue;
          textOverlay.appendChild(el);
        });

        // Wait a tiny bit for render
        await new Promise((resolve) => setTimeout(resolve, 50));

        const canvas = await html2canvas(container, {
          scale: 2, // Higher quality
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        
        // Calculate proper dimensions while maintaining image aspect ratio on PDF
        let drawWidth = pdfWidth;
        let drawHeight = pdfHeight;
        
        const canvasRatio = canvas.height / canvas.width;
        let scaledCanvasHeight = pdfWidth * canvasRatio;

        if (scaleMode === "custom") {
          const scaleFactor = customScale / 100;
          drawWidth = pdfWidth * scaleFactor;
          drawHeight = scaledCanvasHeight * scaleFactor;
        } else if (scaleMode === "shrink") {
          // Shrink by a small margin (e.g. 95%) to allow for hardware printer margins
          drawWidth = pdfWidth * 0.95;
          drawHeight = scaledCanvasHeight * 0.95;
        } else {
           drawHeight = scaledCanvasHeight; 
        }
        
        let startX = (pdfWidth - drawWidth) / 2;
        let startY = (pdfHeight - drawHeight) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", startX, startY, drawWidth, drawHeight);
      }

      pdf.save(`Certificates_${Date.now()}.pdf`);
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

              <button
                onClick={handleSaveTemplate}
                disabled={isSaving}
                className={`w-full mt-4 ${internalPrimaryButtonClassName}`}
              >
                {isSaving ? "Saving..." : "Save Template"}
              </button>
            </div>
          </div>

          <div className={internalCardClassName}>
            <h3 className="text-lg font-semibold text-[#4b302a]">Live Preview</h3>
            <p className="text-xs text-[#7a5a4d] mb-4">Adjust X and Y percentages to position text over the image.</p>
            
            <div className="relative border-4 border-dashed border-[#e0c4ba] bg-[#fffdf3] w-full rounded flex items-center justify-center overflow-hidden">
              {newTemplateImagePreview ? (
                <>
                  <img src={newTemplateImagePreview} className="w-full h-auto block" alt="Template BG" />
                  <div className="absolute inset-0">
                    {fields.map(f => (
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
                        className="font-sans font-bold shadow-sm"
                      >
                        {f.value === "[Name]" ? "John Doe" : f.value === "[Event]" ? "Annual Gala" : f.value === "[Date]" ? "01/01/2026" : f.value === "[Role]" ? "Volunteer" : (f.value || "Custom")}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-gray-400">Upload image to see preview</span>
              )}
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
                           <option key={e.id} value={String(e.id)}>{e.event_name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Render inputs for any Custom fields */}
                  {selectedTemplate.fields.filter(f => f.type === "custom").length > 0 && (
                    <div className="pt-4 border-t border-[#e0c4ba] space-y-3">
                      <h4 className="text-sm font-semibold text-[#4b302a]">Custom Template Fields</h4>
                      {selectedTemplate.fields.filter(f => f.type === "custom").map(f => (
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
                       Ready to generate for {getFilteredPeople().length} individual(s).
                     </p>
                     <button
                        onClick={generatePDFs}
                        disabled={isGenerating || getFilteredPeople().length === 0}
                        className={`w-full ${internalPrimaryButtonClassName}`}
                     >
                        {isGenerating ? "Processing..." : "Generate PDF"}
                     </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={`lg:col-span-2 ${internalCardClassName}`}>
            {selectedTemplate ? (
              <div className="relative w-full border rounded bg-[#fffdf3] overflow-hidden shadow-sm">
                 <img src={selectedTemplate.image_url} className="w-full h-auto block opacity-80" alt="Preview Background" />
                 <div className="absolute inset-0">
                   {selectedTemplate.fields.map(f => (
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
                          ? (f.value === "[Name]" ? "{Name}" : f.value === "[Event]" ? "{Event}" : f.value === "[Date]" ? "{Date}" : "{Role}") 
                          : (customInputs[f.id] || f.value || "{Custom}")}
                      </div>
                    ))}
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
              <div id="text-overlay" style={{ position: "absolute", inset: 0 }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
