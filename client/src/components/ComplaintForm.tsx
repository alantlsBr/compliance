declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

import React, { useEffect, useRef, useState } from "react";
import { Check, Upload, AlertCircle, Loader2, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STEPPER_STEPS, LOCATIONS } from "@/lib/site-data";

interface EvidenceFile {
  name: string;
  type: string;
  size: number;
  content: string;
}

interface FormState {
  anonymous: boolean;
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  harassment_types: string[];
  first_episode_date: string;
  last_episode_date: string;
  location: string;
  description: string;
  aggressor_names: string;
  aggressor_role: string;
  witness_names: string;
  evidence_files: EvidenceFile[];
  wants_contact: boolean;
  contact_channel: string;
  declaration: boolean;
  authorization: boolean;
  captcha_token: string;
}

export default function ComplaintForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetIdRef = useRef<number | null>(null);
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  
  const [form, setForm] = useState<FormState>({
    anonymous: false,
    reporter_name: "",
    reporter_email: "",
    reporter_phone: "",
    harassment_types: [],
    first_episode_date: "",
    last_episode_date: "",
    location: "",
    description: "",
    aggressor_names: "",
    aggressor_role: "",
    witness_names: "",
    evidence_files: [],
    wants_contact: false,
    contact_channel: "",
    declaration: false,
    authorization: false,
    captcha_token: ""
  });

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };


  useEffect(() => {
    if (!recaptchaSiteKey) {
      setCaptchaReady(false);
      setCaptchaError("Chave pública do Google reCAPTCHA não configurada.");
      return;
    }

    const renderCaptcha = () => {
      if (!captchaRef.current || !window.grecaptcha || recaptchaWidgetIdRef.current !== null) return;
      recaptchaWidgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
        sitekey: recaptchaSiteKey,
        callback: (token: string) => {
          updateField("captcha_token", token);
          setCaptchaReady(true);
          setCaptchaError("");
        },
        "expired-callback": () => {
          updateField("captcha_token", "");
          setCaptchaReady(false);
          setCaptchaError("O reCAPTCHA expirou. Marque novamente a validação.");
        },
        "error-callback": () => {
          updateField("captcha_token", "");
          setCaptchaReady(false);
          setCaptchaError("Não foi possível carregar o reCAPTCHA. Verifique bloqueios de rede, proxy ou domínio configurado no Google.");
        },
      });
    };

    if (window.grecaptcha) {
      renderCaptcha();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-recaptcha]");
    if (existingScript) {
      existingScript.addEventListener("load", renderCaptcha, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "true";
    script.onload = renderCaptcha;
    script.onerror = () => {
      setCaptchaError("Não foi possível carregar o script do Google reCAPTCHA. Verifique firewall, proxy, DNS ou bloqueadores do navegador.");
    };
    document.head.appendChild(script);
  }, [recaptchaSiteKey, currentStep]);

  const toggleHarassmentType = (type: string) => {
    setForm(prev => {
      const types = prev.harassment_types.includes(type)
        ? prev.harassment_types.filter(t => t !== type)
        : [...prev.harassment_types, type];
      return { ...prev, harassment_types: types };
    });
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    
    if (totalSize > 20 * 1024 * 1024) {
      toast.error("O tamanho total dos arquivos não pode exceder 20MB.");
      return;
    }

    try {
      const evidenceFiles = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          content: await fileToBase64(file),
        }))
      );

      updateField("evidence_files", [...form.evidence_files, ...evidenceFiles]);
      toast.success(`${files.length} arquivo(s) selecionado(s) com sucesso.`);
    } catch {
      toast.error("Não foi possível carregar um dos arquivos selecionados.");
    }
  };

  const isStepValid = () => {
    if (currentStep === 0) {
      if (!form.anonymous) {
        return form.reporter_name.trim() !== "" && form.reporter_email.trim() !== "";
      }
      return true;
    }
    if (currentStep === 1) {
      return form.harassment_types.length > 0 && form.description.trim() !== "";
    }
    if (currentStep === 2) {
      return form.aggressor_names.trim() !== "";
    }
    if (currentStep === 3) {
      return true; // Evidências são opcionais
    }
    if (currentStep === 4) {
      return form.declaration && form.authorization && !!form.captcha_token;
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error("Por favor, preencha todos os campos obrigatórios (*).");
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (!isStepValid()) {
      toast.error("Por favor, aceite os termos obrigatórios e conclua o CAPTCHA.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const responseText = await response.text();
      let result: { success?: boolean; protocol?: string; message?: string } = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `A API retornou uma resposta inválida. Status HTTP: ${response.status}. Conteúdo: ${responseText.slice(0, 160)}`
          );
        }
      }

      if (!response.ok || !result.success) {
        if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
          window.grecaptcha.reset(recaptchaWidgetIdRef.current);
          updateField("captcha_token", "");
          setCaptchaReady(false);
        }
        throw new Error(result.message || `Falha ao registrar denúncia. Status HTTP: ${response.status}`);
      }

      if (!result.protocol) {
        throw new Error("A denúncia foi enviada, mas a API não retornou o protocolo.");
      }

      setProtocol(result.protocol);
      setIsSubmitted(true);
      toast.success("Denúncia enviada com sucesso!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar a denúncia.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocol);
    toast.success("Protocolo copiado para a área de transferência!");
  };

  const harassmentTypesList = [
    "Assédio Moral",
    "Assédio Sexual",
    "Assédio Discriminatório",
    "Assédio Organizacional",
    "Assédio Vertical",
    "Assédio Horizontal",
    "Assédio Digital",
    "Bullying Trabalhista"
  ];

  if (isSubmitted) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">Denúncia Registrada com Sucesso!</h3>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Seu relato foi recebido de forma segura pelo Conselho de Ética da Empresa Fomentas.
          Guarde o número de protocolo abaixo para acompanhar o andamento.
        </p>

        <div className="bg-muted rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border max-w-md mx-auto">
          <div className="text-left">
            <span className="text-xs text-muted-foreground block uppercase font-semibold tracking-wider">Número de Protocolo</span>
            <span className="text-xl font-mono font-bold text-foreground">{protocol}</span>
          </div>
          <Button onClick={copyProtocol} variant="outline" className="w-full sm:w-auto rounded-xl">
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </Button>
        </div>

        <div className="text-sm text-muted-foreground border-t border-border pt-6 max-w-md mx-auto">
          <p className="mb-2"><strong>Próximo passo:</strong> O Conselho de Ética fará uma análise preliminar em até 15 dias úteis.</p>
          <p className="italic">Agradecemos sua colaboração para manter um ambiente de trabalho ético e seguro.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8 max-w-3xl mx-auto shadow-sm">
      {/* Stepper Header */}
      <div className="grid grid-cols-5 gap-2 mb-8 border-b border-border pb-6 overflow-x-auto">
        {STEPPER_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <div key={idx} className="text-center min-w-[70px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-[#0f2942] text-white"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs block font-semibold truncate ${isActive ? "text-[#0f2942]" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[280px] mb-8">
        {/* PASSO 1: Seus Dados */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-xl p-4 flex items-start gap-3">
              <Check className="w-5 h-5 mt-0.5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm leading-relaxed">
                Seus dados pessoais são opcionais. Marque abaixo se deseja manter o anonimato.
              </p>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="anonymous"
                checked={form.anonymous}
                onCheckedChange={(checked) => updateField("anonymous", !!checked)}
                className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-[#0f2942] data-[state=checked]:border-[#0f2942]"
              />
              <label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Quero manter meu anonimato
              </label>
            </div>

            {!form.anonymous ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="reporter_name">Nome completo *</Label>
                  <Input
                    id="reporter_name"
                    placeholder="Seu nome"
                    value={form.reporter_name}
                    onChange={(e) => updateField("reporter_name", e.target.value)}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="reporter_email">E-mail *</Label>
                  <Input
                    id="reporter_email"
                    type="email"
                    placeholder="seu@email.com"
                    value={form.reporter_email}
                    onChange={(e) => updateField("reporter_email", e.target.value)}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="reporter_phone">Telefone</Label>
                  <Input
                    id="reporter_phone"
                    placeholder="(00) 00000-0000"
                    value={form.reporter_phone}
                    onChange={(e) => updateField("reporter_phone", e.target.value)}
                    className="mt-1.5 rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic bg-muted p-4 rounded-xl border border-border">
                Ao selecionar o anonimato, nenhum dado pessoal seu será gravado no sistema.
              </div>
            )}
          </div>
        )}

        {/* PASSO 2: Sobre o Fato */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block">Tipo de assédio * (pode selecionar mais de um)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                {harassmentTypesList.map((type) => (
                  <div
                    key={type}
                    onClick={() => toggleHarassmentType(type)}
                    className={`flex items-center space-x-2 border rounded-xl p-3 cursor-pointer transition-all ${
                      form.harassment_types.includes(type)
                        ? "border-[#0f2942] bg-primary/[0.02] font-semibold"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      id={`type-${type}`}
                      checked={form.harassment_types.includes(type)}
                      onCheckedChange={() => {}} // tratado no onClick do container
                      className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-[#0f2942] data-[state=checked]:border-[#0f2942]"
                    />
                    <label className="text-sm leading-none cursor-pointer">{type}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_episode_date">Data do primeiro episódio</Label>
                <Input
                  id="first_episode_date"
                  type="date"
                  value={form.first_episode_date}
                  onChange={(e) => updateField("first_episode_date", e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="last_episode_date">Data do último episódio</Label>
                <Input
                  id="last_episode_date"
                  type="date"
                  value={form.last_episode_date}
                  onChange={(e) => updateField("last_episode_date", e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Local</Label>
              <div className="mt-1.5">
                <Select
                  value={form.location}
                  onValueChange={(value) => updateField("location", value)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição detalhada *</Label>
              <Textarea
                id="description"
                placeholder="Descreva o que aconteceu, com o máximo de detalhes (falas, comportamentos, contexto)..."
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="mt-1.5 min-h-[150px] rounded-xl"
              />
            </div>
          </div>
        )}

        {/* PASSO 3: Envolvidos */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="aggressor_names">Nome(s) do(s) agressor(es) *</Label>
              <Input
                id="aggressor_names"
                placeholder="Nome do(s) agressor(es)"
                value={form.aggressor_names}
                onChange={(e) => updateField("aggressor_names", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1">Se houver mais de um, separe por vírgula.</p>
            </div>

            <div>
              <Label htmlFor="aggressor_role">Cargo / Área do agressor</Label>
              <Input
                id="aggressor_role"
                placeholder="Ex.: Gerente de TI, Analista Financeiro"
                value={form.aggressor_role}
                onChange={(e) => updateField("aggressor_role", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="witness_names">Nome(s) de testemunhas (opcional)</Label>
              <Input
                id="witness_names"
                placeholder="Nome das testemunhas"
                value={form.witness_names}
                onChange={(e) => updateField("witness_names", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* PASSO 4: Evidências */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-muted/30">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium text-foreground mb-1">Enviar evidências</p>
              <p className="text-sm text-muted-foreground mb-4">Imagens, PDFs, áudios, prints – limite de 20MB</p>
              <label>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.mp3,.mp4,.wav"
                />
                <Button variant="outline" className="rounded-xl cursor-pointer" asChild>
                  <span>Selecionar arquivos</span>
                </Button>
              </label>
            </div>

            {form.evidence_files.length > 0 && (
              <div className="bg-muted rounded-xl p-4 border border-border">
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0f2942]" />
                  {form.evidence_files.length} arquivo(s) selecionado(s)
                </p>
                <div className="space-y-1">
                  {form.evidence_files.map((file, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground truncate bg-card px-3 py-1.5 rounded-lg border border-border">
                      {file.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground italic">
              Evidências ajudam na apuração, mas não são obrigatórias.
            </p>
          </div>
        )}

        {/* PASSO 5: Finalização */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <Label className="mb-3 block font-semibold">Deseja ser contatado pelo Conselho de Ética?</Label>
              <RadioGroup
                value={form.wants_contact ? "sim" : "nao"}
                onValueChange={(val) => updateField("wants_contact", val === "sim")}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="contact-yes" className="border-muted-foreground/30 text-[#0f2942] focus-visible:ring-[#0f2942]" />
                  <Label htmlFor="contact-yes" className="font-normal cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id="contact-no" className="border-muted-foreground/30 text-[#0f2942] focus-visible:ring-[#0f2942]" />
                  <Label htmlFor="contact-no" className="font-normal cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            {form.wants_contact && (
              <div>
                <Label htmlFor="contact_channel">Canal de contato preferido</Label>
                <div className="mt-1.5">
                  <Select
                    value={form.contact_channel}
                    onValueChange={(val) => updateField("contact_channel", val)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="E-mail">E-mail</SelectItem>
                      <SelectItem value="Telefone">Telefone</SelectItem>
                      <SelectItem value="Sigiloso via plataforma">Sigiloso via plataforma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}


            <div className="pt-4 border-t border-border">
              <Label className="mb-2 block font-semibold">Validação de segurança *</Label>
              <div ref={captchaRef} className="min-h-[78px]" />
              {!captchaReady && !captchaError && (
                <p className="text-xs text-muted-foreground mt-2">Marque a caixa do Google reCAPTCHA para liberar o envio.</p>
              )}
              {captchaError && (
                <p className="text-xs text-red-600 mt-2">{captchaError}</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="declaration"
                  checked={form.declaration}
                  onCheckedChange={(checked) => updateField("declaration", !!checked)}
                  className="mt-0.5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-[#0f2942] data-[state=checked]:border-[#0f2942]"
                />
                <label htmlFor="declaration" className="text-sm cursor-pointer leading-relaxed text-muted-foreground">
                  Declaro que as informações prestadas são verdadeiras e denuncio de boa-fé. *
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="authorization"
                  checked={form.authorization}
                  onCheckedChange={(checked) => updateField("authorization", !!checked)}
                  className="mt-0.5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-[#0f2942] data-[state=checked]:border-[#0f2942]"
                />
                <label htmlFor="authorization" className="text-sm cursor-pointer leading-relaxed text-muted-foreground">
                  Autorizo o Conselho de Ética da Empresa Fomentas a apurar os fatos com base neste relato. *
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stepper Footer Buttons */}
      <div className="flex justify-between border-t border-border pt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0 || isSubmitting}
          className="rounded-xl px-6"
        >
          Anterior
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            className="bg-[#0f2942] hover:bg-[#0f2942]/90 text-white rounded-xl px-6"
          >
            Próximo
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Boolean(currentStep === 4 && !form.captcha_token)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Denúncia"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
