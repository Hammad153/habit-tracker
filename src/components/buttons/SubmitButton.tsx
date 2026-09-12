import React from "react";
import Button, { ButtonProps } from "./Button";

export interface ApSubmitButtonProps extends Omit<ButtonProps, "variant"> {
  enabled?: boolean;
  loadingLabel?: string;
}

export const ApSubmitButton: React.FC<ApSubmitButtonProps> = ({
  label,
  loadingLabel,
  loading = false,
  enabled = true,
  ...props
}) => {
  return (
    <Button
      label={loading && loadingLabel ? loadingLabel : label}
      loading={loading}
      disabled={!enabled}
      variant="primary"
      {...props}
    />
  );
};

export default ApSubmitButton;
