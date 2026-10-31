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

import { useI18n } from "../i18n";

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
  const { t, to, locale } = useI18n();
  // validation returns codes; show them in the page language
  const message = (code?: string) => (code ? t.form.errors[code] ?? code : undefined);
  const option = (o: { value: string; label: string }) => t.form.options[o.value] ?? o.label;
  const [values, setValues] = useState<StartProjectPayload>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [ref, setRef] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const startedAt = useRef(0);
  const sending = useRef(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = t.meta.startTitle;
    startedAt.current = Date.now();
  }, [t.meta.startTitle]);

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
          lang: locale,
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
      helperText={message(errors[key])}
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
      helperText={message(errors[key]) ?? `${values[key].length} / ${LIMITS[key]}`}
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
      helperText={message(errors[key])}
      required
      fullWidth
    >
      {list.map((i) => (
        <MenuItem key={i.value} value={i.value}>
          {option(i)}
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
            {t.form.title1}{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              {t.form.title2}
            </Box>{" "}
            {t.form.title3}
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
            {t.form.lead}
          </Typography>
          {t.form.showEnglishLine && (
          <Typography
            lang="en"
            dir="ltr"
            sx={{ color: "text.secondary", mt: 1.5, fontSize: 14, opacity: 0.8 }}
          >
            Let&apos;s Build Something Great.
          </Typography>
          )}
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
            }}
          >
            <CheckCircleRoundedIcon
              sx={{ fontSize: 56, color: "primary.main", mb: 2 }}
            />
            <Typography component="h2" sx={{ fontWeight: 700, fontSize: 24, mb: 1.5 }}>
              {t.form.successTitle}
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.9, mb: 1 }}>
              {t.form.successText}
            </Typography>
            {ref && (
              <Typography
                dir="ltr"
                sx={{ color: "text.secondary", fontSize: 13, mb: 3 }}
              >
                Ref: {ref}
              </Typography>
            )}
            <Button component="a" href={to("/")} variant="outlined">
              {t.form.backHome}
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
                {t.form.sectionYou}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                {text("name", t.form.name, {
                  required: true,
                  autoComplete: "name",
                })}
                {text("company", t.form.company, {
                  autoComplete: "organization",
                })}
                {text("email", t.form.email, {
                  required: true,
                  type: "email",
                  autoComplete: "email",
                  slotProps: {
                    htmlInput: { maxLength: LIMITS.email, dir: "ltr", inputMode: "email" },
                  },
                })}
                {text("whatsapp", t.form.whatsapp, {
                  required: true,
                  type: "tel",
                  autoComplete: "tel",
                  placeholder: t.form.whatsappPlaceholder,
                  slotProps: {
                    htmlInput: { maxLength: LIMITS.whatsapp, dir: "ltr", inputMode: "tel" },
                  },
                })}
              </Box>
            </Box>

            <Box sx={card}>
              <Typography component="h2" sx={sectionTitle}>
                {t.form.sectionProject}
              </Typography>
              <Box sx={{ display: "grid", gap: 2 }}>
                {select("projectType", t.form.projectType, PROJECT_TYPES)}
                {area("description", t.form.description, 4, true)}
                {area("features", t.form.features, 2)}
                {area("references", t.form.references, 2)}
              </Box>
            </Box>

            <Box sx={card}>
              <Typography component="h2" sx={sectionTitle}>
                {t.form.sectionBudget}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                {select("budget", t.form.budget, BUDGETS)}
                {select("timeline", t.form.timeline, TIMELINES)}
              </Box>

              <FormControl error={!!errors.contactMethod} sx={{ mt: 3 }}>
                <FormLabel id="sp-contact-label">{t.form.contactMethod}</FormLabel>
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
                      label={option(c)}
                    />
                  ))}
                </RadioGroup>
                {errors.contactMethod && (
                  <FormHelperText>{message(errors.contactMethod)}</FormHelperText>
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
                    {t.form.consentBefore}
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
                      {t.form.consentLink}
                    </Box>
                    {t.form.consentAfter}
                  </Typography>
                }
              />
              {errors.consent && <FormHelperText>{message(errors.consent)}</FormHelperText>}
            </FormControl>

            {status === "error" && (
              <Alert severity="error" role="alert">
                {t.form.sendError}{" "}
                <bdi>ibrahim.dev.pr@gmail.com</bdi>
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
              }}
            >
              {status === "sending" ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1.5 }} />
                  {t.form.sending}
                </>
              ) : (
                t.form.submit
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
        <DialogTitle id="sp-privacy-title">{t.form.privacyTitle}</DialogTitle>
        <DialogContent>
          <Typography sx={{ lineHeight: 2, fontSize: 15 }}>
            {t.form.privacyIntro}
            {t.form.privacyPoints.map((point, i) => (
              <span key={i}>
                <br />• {point}
                {i === t.form.privacyPoints.length - 1 && (
                  <>
                    {" "}
                    <bdi>ibrahim.dev.pr@gmail.com</bdi>.
                  </>
                )}
              </span>
            ))}
          </Typography>
          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button onClick={() => setPrivacyOpen(false)}>{t.form.close}</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default StartProject;
