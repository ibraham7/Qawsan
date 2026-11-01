import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { useI18n } from "../i18n";
import { REVIEW_LIMITS, validateReview } from "../lib/review";
import type { ReviewErrors } from "../lib/review";
import { EASE, GREEN, fade } from "../theme/motion";

interface Props {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

const GOLD = "#FFC83D";

type Status = "idle" | "sending" | "success" | "error";

/** five clickable stars; the row follows the pointer before you choose */
function StarPicker({
  value,
  onChange,
  labels,
  error,
}: {
  value: number;
  onChange: (n: number) => void;
  labels: string[];
  error: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <Box>
      <Box
        dir="ltr"
        role="radiogroup"
        onPointerLeave={() => setHover(0)}
        sx={{ display: "inline-flex", gap: 0.5 }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Box
            key={n}
            component="button"
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} — ${labels[n - 1]}`}
            onClick={() => onChange(n)}
            onPointerEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            sx={{
              all: "unset",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              width: 52,
              height: 52,
              borderRadius: "16px",
              color: n <= shown ? GOLD : "text.disabled",
              transition: `color 250ms ease, scale 350ms ${EASE}`,
              scale: n <= shown ? "1.08" : "1",
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
            }}
          >
            <StarRoundedIcon sx={{ fontSize: 40 }} />
          </Box>
        ))}
      </Box>
      <Typography
        aria-live="polite"
        sx={{ m: 0, mt: 0.5, minHeight: 24, fontSize: 15, fontWeight: 600, color: error ? "error.main" : "primary.main" }}
      >
        {shown ? labels[shown - 1] : " "}
      </Typography>
    </Box>
  );
}

function Review({ mode, onToggleTheme }: Props) {
  const { t, to, locale } = useI18n();
  const [values, setValues] = useState({ name: "", role: "", text: "", rating: 0, consent: false, website: "" });
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const startedAt = useRef(0);
  const sending = useRef(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = t.review.metaTitle;
    startedAt.current = Date.now();
  }, [t.review.metaTitle]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const message = (code?: string) => (code ? t.review.errors[code] ?? code : undefined);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending.current) return;

    const payload = { ...values, lang: locale, elapsed: Date.now() - startedAt.current };
    const found = validateReview(payload);
    setErrors(found);
    if (Object.keys(found).length) return;

    sending.current = true;
    setStatus("sending");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; fields?: ReviewErrors } | null;
      if (res.ok && data?.ok) {
        setStatus("success");
      } else {
        if (data?.fields) setErrors(data.fields);
        setStatus("error");
        sending.current = false;
      }
    } catch {
      setStatus("error");
      sending.current = false;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar mode={mode} onToggleTheme={onToggleTheme} />

      <Container component="main" maxWidth="sm" sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          <Typography
            component="h1"
            sx={{ m: 0, mb: 2, fontWeight: 700, fontSize: { xs: 32, sm: 42, md: 50 }, lineHeight: 1.25 }}
          >
            {t.review.title1}{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              {t.review.title2}
            </Box>
          </Typography>
          <Typography sx={{ m: 0, color: "text.secondary", fontSize: { xs: 15, md: 17 }, lineHeight: 1.9 }}>
            {t.review.lead}
          </Typography>
        </Box>

        {status === "success" ? (
          <Box
            ref={successRef}
            tabIndex={-1}
            role="status"
            sx={{
              textAlign: "center",
              p: { xs: 4, md: 6 },
              borderRadius: "28px",
              border: "1px solid",
              borderColor: `rgba(${GREEN}, 0.35)`,
              bgcolor: "background.paper",
              outline: "none",
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography component="h2" sx={{ m: 0, mb: 1.5, fontWeight: 700, fontSize: 26 }}>
              {t.review.successTitle}
            </Typography>
            <Typography sx={{ m: 0, mb: 3, color: "text.secondary", lineHeight: 1.9 }}>{t.review.successText}</Typography>
            <Button component="a" href={to("/")} variant="outlined">
              {t.review.back}
            </Button>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={submit}
            noValidate
            aria-busy={status === "sending"}
            sx={{
              display: "grid",
              gap: 3,
              p: { xs: 3, md: 4.5 },
              borderRadius: "28px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: fade(["border-color"], 400),
              "&:focus-within": { borderColor: `rgba(${GREEN}, 0.45)` },
            }}
          >
            {/* honeypot: hidden from people and assistive tech */}
            <Box aria-hidden="true" sx={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
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

            <FormControl error={!!errors.rating}>
              <Typography component="label" sx={{ mb: 1, fontWeight: 600, fontSize: 15 }}>
                {t.review.rating}
              </Typography>
              <StarPicker
                value={values.rating}
                onChange={(n) => set("rating", n)}
                labels={t.review.ratingLabels}
                error={!!errors.rating}
              />
              {errors.rating && <FormHelperText>{message(errors.rating)}</FormHelperText>}
            </FormControl>

            <TextField
              id="rv-name"
              label={t.review.name}
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              error={!!errors.name}
              helperText={message(errors.name)}
              required
              fullWidth
              autoComplete="name"
              slotProps={{ htmlInput: { maxLength: REVIEW_LIMITS.name } }}
            />

            <TextField
              id="rv-role"
              label={t.review.role}
              placeholder={t.review.rolePlaceholder}
              value={values.role}
              onChange={(e) => set("role", e.target.value)}
              error={!!errors.role}
              helperText={message(errors.role)}
              fullWidth
              autoComplete="organization-title"
              slotProps={{ htmlInput: { maxLength: REVIEW_LIMITS.role } }}
            />

            <TextField
              id="rv-text"
              label={t.review.text}
              value={values.text}
              onChange={(e) => set("text", e.target.value)}
              error={!!errors.text}
              helperText={message(errors.text) ?? `${values.text.length} / ${REVIEW_LIMITS.text}`}
              required
              multiline
              minRows={5}
              fullWidth
              slotProps={{ htmlInput: { maxLength: REVIEW_LIMITS.text } }}
            />

            <FormControl error={!!errors.consent}>
              <FormControlLabel
                control={<Checkbox checked={values.consent} onChange={(e) => set("consent", e.target.checked)} />}
                label={<Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>{t.review.consent}</Typography>}
              />
              {errors.consent && <FormHelperText>{message(errors.consent)}</FormHelperText>}
            </FormControl>

            {status === "error" && (
              <Alert severity="error" role="alert">
                {t.review.error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={status === "sending"}
              sx={{ minHeight: 54, borderRadius: 999, fontWeight: 700, fontSize: 16, color: "#04110C" }}
            >
              {status === "sending" ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1.5 }} />
                  {t.review.sending}
                </>
              ) : (
                t.review.submit
              )}
            </Button>
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
}

export default Review;
