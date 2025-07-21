"use client";
import { assignMembersToFlat } from "@/services/flats";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import CommonButton from "../common/CommonButton";

const schema = z.object({
  user_id: z.array(z.string()).min(1, "Select at least one user"),
  move_in_date: z.string().min(1, "Select move-in date"),
});

type FormValues = z.infer<typeof schema>;

type AssignMemberModalProps = {
  open: boolean;
  onClose: () => void;
  societyId: string;
  buildingId: string;
  flatId: string;
  users?: {
    id: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
  }[];
};

export default function AssignMemberModal({
  open,
  onClose,
  societyId,
  buildingId,
  flatId,
  users = [],
}: AssignMemberModalProps) {
  const qc = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { user_id: [], move_in_date: "" },
  });

  const mut = useMutation({
    mutationFn: (data: FormValues) =>
      assignMembersToFlat(societyId, buildingId, flatId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assigned", societyId, buildingId] });
      qc.invalidateQueries({
        queryKey: ["vacantFlats", societyId, buildingId],
      });
      reset();
      onClose();
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => mut.mutate(data);

  const getDisplayName = (user: any) =>
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.name || user?.email || `User ${user.id}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Assign Members
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select members and their move-in date
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}
        >
          {/* Members Multi-Select */}
          <Controller
            name="user_id"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.user_id}>
                <InputLabel>Members</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={
                    <OutlinedInput label="Members" sx={{ borderRadius: 2 }} />
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => {
                        const user = users.find((u) => u.id === value);
                        return (
                          <Chip
                            key={value}
                            label={getDisplayName(user)}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                >
                  {users.length > 0 ? (
                    users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {getDisplayName(user)}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No users available</MenuItem>
                  )}
                </Select>
                {errors.user_id && (
                  <Typography color="error" variant="caption">
                    {errors.user_id.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Move-in Date */}
          <Controller
            name="move_in_date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Move-in Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                placeholder="Select date"
                error={!!errors.move_in_date}
                helperText={errors.move_in_date?.message}
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
            loading={mut.isPending}
            sx={{ bgcolor: "#1e1ee4" }}
          >
            Assign Members
          </CommonButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
