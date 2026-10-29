import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import {
  BUDGETS,
  CONTACT_METHODS,
  LIMITS,
  PROJECT_TYPES,
  TIMELINES,
  validate,
} from "../lib/startProject";
import type { FieldErrors, StartProjectPayload } from "../lib/startProject";

interface Props {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

const EMPTY: StartProjectPayload = {
  name: "",
  company: "",
  email: "",
  whatsapp: "",
  projectType: "",
  description: "",
  features: "",
  references: "",
  budget: "",
  timeline: "",
  contactMethod: "whatsapp",
  consent: false,
  website: "",
  elapsed: 0,
};

type Status = "idle" | "sending" | "success" | "error";

const sectionTitle = {
  fontWeight: 600,
  fontSize: { xs: 17, md: 19 },
  mb: 2,
  color: "text.primary",
} as const;

const card = {
  p: { xs: 2.5, md: 3.5 },
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  transition: "border-color 250ms ease",
  "&:focus-within": { borderColor: "primary.main" },
} as const;

function StartProject({ mode, onToggleTheme }: Props) {
  const [values, setValues] = useState<StartProjectPayload>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [ref, setRef] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const startedAt = useRef(0);
  const sending = useRef(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "ابدأ مشروعك | قوسان — Qawsan Studio";
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const set = <K extends keyof StartProjectPayload>(
    key: K,
    value: StartProjectPayload[K]
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending.current) return; // block double submits

    const found = validate(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`sp-${first}`)?.focus();
      return;
    }

    sending.current = true;
    setStatus("sending");
    try {
      const res = await fetch("/api/start-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          elapsed: Date.now() - startedAt.current,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        ref?: string;
        fields?: FieldErrors;
      } | null;

      if (res.ok && data?.ok) {
        setRef(data.ref ?? "");
        setValues(EMPTY);
        setStatus("success");
        return;
      }
      if (data?.fields) setErrors(data.fields);
      setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  };

  const text = (
    key: "name" | "company" | "email" | "whatsapp",
    label: string,
    extra: Record<string, unknown> = {}
  ) => (
    <TextField
      id={`sp-${key}`}
      label={label}
      value={values[key]}
      onChange={(e) => set(key, e.target.value)}
      error={!!errors[key]}
      helperText={errors[key]}
      fullWidth
      slotProps={{ htmlInput: { maxLength: LIMITS[key] } }}
      {...extra}
    />
  );

  const area = (
    key: "description" | "features" | "references",
    label: string,
    rows: number,
    required = false
  ) => (
    <TextField
      id={`sp-${key}`}
      label={label}
      value={values[key]}
      onChange={(e) => set(key, e.target.value)}
      error={!!errors[key]}
      helperText={errors[key] ?? `${values[key].length} / ${LIMITS[key]}`}
      required={required}
      multiline
      minRows={rows}
      fullWidth
      slotProps={{ htmlInput: { maxLength: LIMITS[key] } }}
    />
  );

  const select = (
    key: "projectType" | "budget" | "timeline",
    label: string,
    list: readonly { value: string; label: string }[]
  ) => (
    <TextField
      select
      id={`sp-${key}`}
      label={label}
      value={values[key]}
      onChange={(e) => set(key, e.target.value)}
      error={!!errors[key]}
      helperText={errors[key]}
      required
      fullWidth
    >
      {list.map((i) => (
        <MenuItem key={i.value} value={i.value}>
          {i.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar mode={mode} onToggleTheme={onToggleTheme} />

      <Container
        component="main"
        maxWidth="md"
        sx={{ pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 } }}
      >
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: 30, sm: 40, md: 48 },
              lineHeight: 1.3,
              mb: 2,
            }}
          >
            لنبنِ{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              شيئًا عظيمًا
            </Box>{" "}
            معًا
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 560,
              mx: "auto",
              fontSize: { xs: 15, md: 17 },
              lineHeight: 1.9,
            }}
          >
            أخبرنا عن فكرتك، وسنساعدك على تحويلها إلى تجربة رقمية ذات معنى.
          </Typography>
          <Typography
            lang="en"
            dir="ltr"
            sx={{ color: "text.secondary", mt: 1.5, fontSize: 14, opacity: 0.8 }}
          >
            Let&apos;s Build Something Great.
          </Typography>
        </Box>

        {status === "success" ? (
          <Box
            ref={successRef}
            tabIndex={-1}
            role="status"
            sx={{
              ...card,
              textAlign: "center",
              py: { xs: 6, md: 8 },
              outline: "none",
              animation: "spFade 500ms ease both",
              "@keyframes spFade": {
                from: { opacity: 0, transform: "translateY(12px)" },
                to: { opacity: 1, transform: "none" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            <CheckCircleRoundedIcon
              sx={{ fontSize: 56, color: "primary.main", mb: 2 }}
            />
            <Typography component="h2" sx={{ fontWeight: 700, fontSize: 24, mb: 1.5 }}>
              شكرًا لك! استلمنا طلب مشروعك
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.9, mb: 1 }}>
              سنعاود التواصل معك في أقرب وقت ممكن.
            </Typography>
            {ref && (
              <Typography
                dir="ltr"
                sx={{ color: "text.secondary", fontSize: 13, mb: 3 }}
              >
                Ref: {ref}
              </Typography>
            )}
            <Button component="a" href="/" variant="outlined">
              العودة للرئيسية
            </Button>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={submit}
            noValidate
            aria-busy={status === "sending"}
            sx={{ display: "grid", gap: 3 }}
          >
            {/* Honeypot: hidden from people and assistive tech */}
            <Box
              aria-hidden="true"
              sx={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}
            >
              <label>
                Website
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </label>
            </Box>

            <Box sx={card}>
              <Typography component="h2" sx={sectionTitle}>
                بياناتك
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                {text("name", "الاسم الكامل", {
                  required: true,
                  autoComplete: "name",
                })}
                {text("company", "اسم الشركة أو المؤسسة (اختياري)", {
                  autoComplete: "organization",
                })}
                {text("email", "البريد الإلكتروني", {
                  required: true,
                  type: "email",
                  autoComplete: "email",
                  slotProps: {
                    htmlInput: { maxLength: LIMITS.email, dir: "ltr", inputMode: "email" },
                  },
                })}
                {text("whatsapp", "رقم واتساب مع رمز الدولة", {
                  required: true,
                  type: "tel",
                  autoComplete: "tel",
                  placeholder: "+962 79 123 4567",
                  slotProps: {
                    htmlInput: { maxLength: LIMITS.whatsapp, dir: "ltr", inputMode: "tel" },
                  },
                })}
              </Box>
            </Box>

            <Box sx={card}>
              <Typography component="h2" sx={sectionTitle}>
                مشروعك
              </Typography>
              <Box sx={{ display: "grid", gap: 2 }}>
                {select("projectType", "نوع المشروع", PROJECT_TYPES)}
                {area("description", "وصف المشروع", 4, true)}
                {area("features", "الميزات المطلوبة (اختياري)", 2)}
                {area("references", "روابط أو أمثلة مشابهة (اختياري)", 2)}
              </Box>
            </Box>

            <Box sx={card}>
              <Typography component="h2" sx={sectionTitle}>
                الميزانية والمدة
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                {select("budget", "الميزانية التقريبية", BUDGETS)}
                {select("timeline", "المدة المطلوبة", TIMELINES)}
              </Box>

              <FormControl error={!!errors.contactMethod} sx={{ mt: 3 }}>
                <FormLabel id="sp-contact-label">كيف تفضّل أن نتواصل معك؟</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="sp-contact-label"
                  value={values.contactMethod}
                  onChange={(e) => set("contactMethod", e.target.value)}
                >
                  {CONTACT_METHODS.map((c) => (
                    <FormControlLabel
                      key={c.value}
                      value={c.value}
                      control={<Radio />}
                      label={c.label}
                    />
                  ))}
                </RadioGroup>
                {errors.contactMethod && (
                  <FormHelperText>{errors.contactMethod}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <FormControl error={!!errors.consent}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="sp-consent"
                    checked={values.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>
                    أوافق على استخدام بياناتي للتواصل معي بخصوص هذا الطلب، وقد قرأت{" "}
                    <Box
                      component="button"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPrivacyOpen(true);
                      }}
                      sx={{
                        all: "unset",
                        cursor: "pointer",
                        color: "primary.main",
                        textDecoration: "underline",
                      }}
                    >
                      سياسة الخصوصية
                    </Box>
                    .
                  </Typography>
                }
              />
              {errors.consent && <FormHelperText>{errors.consent}</FormHelperText>}
            </FormControl>

            {status === "error" && (
              <Alert severity="error" role="alert">
                تعذّر إرسال طلبك الآن. تحقق من البيانات وحاول مرة أخرى، أو راسلنا مباشرة على
                ibrahim.dev.pr@gmail.com.
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={status === "sending"}
              sx={{
                minHeight: 52,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 16,
                color: "background.default",
                transition: "transform 200ms ease",
                "&:hover": { transform: "translateY(-2px)" },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                  "&:hover": { transform: "none" },
                },
              }}
            >
              {status === "sending" ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ ml: 1.5 }} />
                  جارٍ الإرسال...
                </>
              ) : (
                "إرسال طلب المشروع"
              )}
            </Button>
          </Box>
        )}
      </Container>

      <Footer />

      <Dialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="sp-privacy-title"
      >
        <DialogTitle id="sp-privacy-title">سياسة الخصوصية</DialogTitle>
        <DialogContent>
          <Typography sx={{ lineHeight: 2, fontSize: 15 }}>
            نجمع في هذا النموذج بياناتك (الاسم، الشركة، البريد، رقم واتساب، وتفاصيل
            المشروع) لغرض واحد: دراسة طلبك والتواصل معك بخصوصه.
            <br />
            • تُحفظ البيانات في سجل خاص بقوسان، ولا يصل إليه إلا فريق قوسان المخوّل.
            <br />
            • لا نبيع بياناتك ولا نشاركها مع أي جهة إعلانية، ولا نرسلها إلى أدوات التحليلات.
            <br />
            • نحتفظ بالطلب للمدة اللازمة للتواصل معك ولمتابعة المشروع.
            <br />
            • يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت بمراسلتنا على
            ibrahim.dev.pr@gmail.com.
          </Typography>
          <Box sx={{ textAlign: "left", mt: 2 }}>
            <Button onClick={() => setPrivacyOpen(false)}>إغلاق</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default StartProject;
