// Placeholder for the tabs built in later stages.

import { Box, Button, Typography } from "@mui/material";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";

export default function ComingSoon({ title, stage, points, onBack }: { title: string; stage: string; points: string[]; onBack: () => void }) {
    return (
        <Box sx={{ p: { xs: 3, md: 5 }, borderRadius: "20px", border: "1px dashed", borderColor: "divider", bgcolor: "background.paper", textAlign: "center" }}>
            <ConstructionRoundedIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography component="h2" sx={{ m: 0, mt: 1, fontSize: 20, fontWeight: 700 }}>
                {title}
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{stage}</Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: "20px auto 0", maxWidth: 520, textAlign: "start", display: "flex", flexDirection: "column", gap: 1 }}>
                {points.map((p) => (
                    <Typography component="li" key={p} sx={{ fontSize: 14, display: "flex", gap: 1 }}>
                        <Box component="span" sx={{ color: "primary.main" }}>•</Box>
                        {p}
                    </Typography>
                ))}
            </Box>
            <Button sx={{ mt: 3 }} onClick={onBack}>
                العودة إلى اكتشاف العملاء
            </Button>
        </Box>
    );
}
