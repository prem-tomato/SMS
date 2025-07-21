'use client';

import { Button, CircularProgress, ButtonProps } from '@mui/material';

type CommonButtonProps = {
  loading?: boolean;
  children: React.ReactNode;
} & ButtonProps;

export default function CommonButton({
  loading,
  children,
  disabled,
  ...props
}: CommonButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      sx={{
        textTransform: 'none',
        minWidth: 140,
        px: 3,
        borderRadius: 2,
        ...props.sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={24} sx={{ color: 'white' }} />
      ) : (
        children
      )}
    </Button>
  );
}
