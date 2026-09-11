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
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            dir="rtl"
            PaperProps={{
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
                    onSubmit={(event) => {
                        event.preventDefault();
                    }}
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
                        required
                        variant="outlined"
                    />

                    {/* Contact */}

                    <TextField
                        fullWidth
                        label="وسيلة التواصل"
                        placeholder="البريد الإلكتروني أو رقم واتساب"
                        required
                        variant="outlined"
                    />

                    {/* Project Name */}

                    <TextField
                        fullWidth
                        label="اسم المشروع"
                        placeholder="اسم مشروعك"
                        variant="outlined"
                    />

                    {/* Service */}

                    <TextField
                        select
                        fullWidth
                        label="نوع المشروع"
                        defaultValue=""
                        required
                        variant="outlined"
                    >
                        <MenuItem value="">
                            اختر نوع المشروع
                        </MenuItem>

                        <MenuItem value="branding">
                            الهوية البصرية
                        </MenuItem>

                        <MenuItem value="uiux">
                            UI / UX
                        </MenuItem>

                        <MenuItem value="development">
                            تطوير موقع
                        </MenuItem>

                        <MenuItem value="digital-product">
                            منتج رقمي
                        </MenuItem>

                        <MenuItem value="full-project">
                            مشروع متكامل
                        </MenuItem>
                    </TextField>

                    {/* Design */}

                    <TextField
                        select
                        fullWidth
                        label="هل لديك تصميم جاهز؟"
                        defaultValue=""
                        variant="outlined"
                    >
                        <MenuItem value="">
                            اختر إجابتك
                        </MenuItem>

                        <MenuItem value="yes">
                            نعم، لدي تصميم جاهز
                        </MenuItem>

                        <MenuItem value="no">
                            لا، أحتاج إلى التصميم
                        </MenuItem>

                        <MenuItem value="not-sure">
                            غير متأكد
                        </MenuItem>
                    </TextField>

                    {/* Budget */}

                    <TextField
                        select
                        fullWidth
                        label="الميزانية التقريبية"
                        defaultValue=""
                        variant="outlined"
                    >
                        <MenuItem value="">
                            اختر الميزانية
                        </MenuItem>

                        <MenuItem value="under-500">
                            أقل من 500$
                        </MenuItem>

                        <MenuItem value="500-1000">
                            500$ – 1,000$
                        </MenuItem>

                        <MenuItem value="1000-2500">
                            1,000$ – 2,500$
                        </MenuItem>

                        <MenuItem value="2500-plus">
                            أكثر من 2,500$
                        </MenuItem>

                        <MenuItem value="not-sure">
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
                        required
                        variant="outlined"
                        sx={{
                            gridColumn: {
                                xs: "auto",
                                sm: "1 / -1",
                            },
                        }}
                    />

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

                                color: "background.default",

                                "&:hover": {
                                    backgroundColor:
                                        "primary.main",

                                    transform:
                                        "translateY(-2px)",
                                },

                                transition:
                                    "transform 200ms ease",
                            }}
                        >
                            إرسال طلب المشروع
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default ProjectForm;