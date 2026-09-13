import { useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
}

function ProjectForm({
  open,
  onClose,
}: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccess(false);
    setError(false);

    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.append(
      "access_key",
      "50ad71db-9a09-43f1-b435-cee6b07de324"
    );

    formData.append(
      "subject",
      "طلب مشروع جديد — قوسان"
    );

    formData.append(
      "from_name",
      "Qawsan Project Form"
    );

    try {
      const response = await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "حدث خطأ أثناء الإرسال"
        );
      }

      setSuccess(true);

      form.reset();

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      dir="rtl"
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            backgroundImage: "none",

            border: "1px solid",
            borderColor: "divider",

            borderRadius: {
              xs: 3,
              sm: 4,
            },

            overflow: "hidden",
          },
        },
      }}
    >
      {/* Header */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          px: {
            xs: 2.5,
            sm: 4,
          },

          pt: {
            xs: 2.5,
            sm: 3.5,
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: "primary.main",
            direction: "ltr",
          }}
        >
          {"{ START A PROJECT }"}
        </Typography>

        <IconButton
          onClick={onClose}
          aria-label="إغلاق"
          sx={{
            width: 40,
            height: 40,

            color: "text.secondary",

            "&:hover": {
              color: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Title */}

      <DialogTitle
        sx={{
          px: {
            xs: 2.5,
            sm: 4,
          },

          pt: 2,
          pb: 1,

          fontSize: {
            xs: 28,
            sm: 36,
          },

          fontWeight: 700,

          color: "text.primary",

          textAlign: "right",
        }}
      >
        لنبدأ مشروعك.
      </DialogTitle>

      {/* Content */}

      <DialogContent
        sx={{
          px: {
            xs: 2.5,
            sm: 4,
          },

          pb: {
            xs: 3,
            sm: 4,
          },
        }}
      >
        <Typography
          sx={{
            mb: 4,

            color: "text.secondary",

            fontSize: 15,

            lineHeight: 1.8,

            textAlign: "right",

            direction: "rtl",

            unicodeBidi: "plaintext",
          }}
        >
          أخبرنا عن فكرتك وبعض التفاصيل عنها، وسنتواصل
          معك لمناقشة المشروع والخطوات المناسبة لتنفيذه.
        </Typography>

        {/* Form */}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },

            gap: 2,

            direction: "rtl",
          }}
        >
          {/* Name */}

          <TextField
            fullWidth
            label="الاسم"
            placeholder="اكتب اسمك"
            name="name"
            required
            variant="outlined"
          />

          {/* Contact */}

          <TextField
            fullWidth
            label="وسيلة التواصل"
            placeholder="البريد الإلكتروني أو رقم واتساب"
            name="contact"
            required
            variant="outlined"
          />

          {/* Project Name */}

          <TextField
            fullWidth
            label="اسم المشروع"
            placeholder="اسم مشروعك"
            name="project_name"
            variant="outlined"
          />

          {/* Service */}

          <TextField
            select
            fullWidth
            label="نوع المشروع"
            name="project_type"
            defaultValue=""
            required
            variant="outlined"
          >
            <MenuItem value="">
              اختر نوع المشروع
            </MenuItem>

            <MenuItem value="الهوية البصرية">
              الهوية البصرية
            </MenuItem>

            <MenuItem value="UI / UX">
              UI / UX
            </MenuItem>

            <MenuItem value="تطوير موقع">
              تطوير موقع
            </MenuItem>

            <MenuItem value="منتج رقمي">
              منتج رقمي
            </MenuItem>

            <MenuItem value="مشروع متكامل">
              مشروع متكامل
            </MenuItem>
          </TextField>

          {/* Design */}

          <TextField
            select
            fullWidth
            label="هل لديك تصميم جاهز؟"
            name="has_design"
            defaultValue=""
            variant="outlined"
          >
            <MenuItem value="">
              اختر إجابتك
            </MenuItem>

            <MenuItem value="نعم، لدي تصميم جاهز">
              نعم، لدي تصميم جاهز
            </MenuItem>

            <MenuItem value="لا، أحتاج إلى التصميم">
              لا، أحتاج إلى التصميم
            </MenuItem>

            <MenuItem value="غير متأكد">
              غير متأكد
            </MenuItem>
          </TextField>

          {/* Budget */}

          <TextField
            select
            fullWidth
            label="الميزانية التقريبية"
            name="budget"
            defaultValue=""
            variant="outlined"
          >
            <MenuItem value="">
              اختر الميزانية
            </MenuItem>

            <MenuItem value="أقل من 500$">
              أقل من 500$
            </MenuItem>

            <MenuItem value="500$ – 1,000$">
              500$ – 1,000$
            </MenuItem>

            <MenuItem value="1,000$ – 2,500$">
              1,000$ – 2,500$
            </MenuItem>

            <MenuItem value="أكثر من 2,500$">
              أكثر من 2,500$
            </MenuItem>

            <MenuItem value="غير محددة بعد">
              غير محددة بعد
            </MenuItem>
          </TextField>

          {/* Description */}

          <TextField
            fullWidth
            multiline
            minRows={5}
            label="حدثنا عن فكرتك"
            placeholder="ما الذي تريد بناءه؟ وما الهدف من المشروع؟"
            name="project_details"
            required
            variant="outlined"
            sx={{
              gridColumn: {
                xs: "auto",
                sm: "1 / -1",
              },
            }}
          />

          {/* Success */}

          {success && (
            <Box
              sx={{
                gridColumn: {
                  xs: "auto",
                  sm: "1 / -1",
                },

                p: 2,

                borderRadius: 2,

                backgroundColor:
                  "rgba(0, 208, 132, 0.08)",

                border: "1px solid",

                borderColor: "primary.main",
              }}
            >
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                تم إرسال طلبك بنجاح، سنتواصل معك قريبًا.
              </Typography>
            </Box>
          )}

          {/* Error */}

          {error && (
            <Box
              sx={{
                gridColumn: {
                  xs: "auto",
                  sm: "1 / -1",
                },

                p: 2,

                borderRadius: 2,

                backgroundColor:
                  "rgba(220, 50, 50, 0.08)",

                border: "1px solid",

                borderColor: "error.main",
              }}
            >
              <Typography
                sx={{
                  color: "error.main",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                حدث خطأ أثناء الإرسال. حاول مرة أخرى.
              </Typography>
            </Box>
          )}

          {/* Submit */}

          <Box
            sx={{
              gridColumn: {
                xs: "auto",
                sm: "1 / -1",
              },

              display: "flex",

              justifyContent: "flex-start",

              mt: 1,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              endIcon={
                <ArrowOutwardRoundedIcon />
              }
              sx={{
                minHeight: 52,

                px: 3.5,

                borderRadius: 2,

                fontSize: 15,

                fontWeight: 500,

                backgroundColor:
                  "primary.main",

                color:
                  "background.default",

                "&:hover": {
                  backgroundColor:
                    "primary.main",

                  transform:
                    "translateY(-2px)",
                },

                "&:disabled": {
                  backgroundColor:
                    "primary.main",

                  opacity: 0.6,
                },

                transition:
                  "transform 200ms ease",
              }}
            >
              {isSubmitting
                ? "جاري الإرسال..."
                : "إرسال طلب المشروع"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectForm;