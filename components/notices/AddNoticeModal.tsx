"use client";
import { createNotice } from "@/services/notices";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import CommonButton from "../common/CommonButton";

const schema = z.object({
  title: z.string().min(1, "Title required"),
  content: z.string().min(1, "Content required"),
});
type FormValues = z.infer<typeof schema>;

export default function AddNoticeModal({
  open,
  onClose,
  societyId,
}: {
  open: boolean;
  onClose: () => void;
  societyId: string;
}) {
  const qc = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => createNotice(societyId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notices", societyId] });
      reset();
      onClose();
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => mutation.mutate(data);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          New Notice
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter notice title and content below
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}
        >
          {/* Title */}
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                placeholder="e.g., Water Supply Disruption"
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            )}
          />

          {/* Content */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Content"
                placeholder="Describe the notice details here..."
                multiline
                rows={4}
                error={!!errors.content}
                helperText={errors.content?.message}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <CommonButton
            type="submit"
            variant="contained"
            loading={mutation.isPending}
            sx={{ bgcolor: "#1e1ee4" }}
          >
            Save Notice
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
