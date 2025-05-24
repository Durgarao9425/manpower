import React, { useState } from "react";
import { Controller,  } from "react-hook-form";
import type { Control } from "react-hook-form";
import {
  TextField,
  InputAdornment,
  FormControl,
  FormHelperText,
  IconButton,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputLabel,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Phone } from "@mui/icons-material";

interface Option {
  value: string | number;
  label: string;
}

interface ReusableInputProps {
  label: string;
  name: string;
  type?:
    | "text"
    | "email"
    | "address"
    | "number"
    | "date"
    | "mobile"
    | "files"
    | "password"
    | "select"
    | "multiSelect"
    | "checkbox";
  isRequired?: boolean;
  isDisabled?: boolean;
  onChange?: (
    value: string | number | FileList | boolean | (string | number)[]
  ) => void;
  errorMessage?: string;
  helperText?: string;
  control?: Control<any>;
  options?: Option[];
  rules?: Record<string, any>;
}

export const ReusableInput: React.FC<ReusableInputProps> = ({
  label,
  name,
  type = "text",
  isRequired = false,
  isDisabled = false,
  onChange,
  errorMessage,
  helperText,
  control,
  options = [],
  rules = {},
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordToggle = () => setShowPassword((prev) => !prev);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: any
  ) => {
    let value: any = e.target.value.trim();
    if (type === "files") {
      value = (e.target as HTMLInputElement).files;
    } else if (type === "checkbox") {
      value = (e.target as HTMLInputElement).checked;
    }
    field.onChange(value || "");
    if (onChange) onChange(value);
  };

  const renderInput = (field: any) => {
    const inputProps = {
      ...field,
      label: isRequired ? `${label} *` : label,
      fullWidth: true,
      variant: "outlined" as const,
      disabled: isDisabled,
      error: Boolean(errorMessage),
      helperText: helperText || errorMessage,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        handleChange(e, field),
    };

    switch (type) {
      case "text":
      case "email":
        return <TextField {...inputProps} type="text" />;
      case "address":
        return <TextField {...inputProps} multiline rows={4} />;
      case "number":
        return <TextField {...inputProps} type="number" />;
      case "date":
        return (
          <TextField
            {...inputProps}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        );
      case "mobile":
        return (
          <TextField
            {...inputProps}
            type="tel"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        );
      case "files":
        return (
          <FormControl fullWidth>
            <input
              type="file"
              accept="image/*"
              disabled={isDisabled}
              onChange={(e) =>
                field.onChange((e.target as HTMLInputElement).files)
              }
              id={name}
            />
            {errorMessage && (
              <FormHelperText error>{errorMessage}</FormHelperText>
            )}
          </FormControl>
        );
      case "password":
        return (
          <TextField
            {...inputProps}
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handlePasswordToggle}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        );
      case "select":
        return (
          <FormControl fullWidth>
            <InputLabel id={`${name}-label`}>
              {isRequired ? `${label} *` : label}
            </InputLabel>
            <Select
              labelId={`${name}-label`}
              id={`${name}-select`}
              value={field.value ?? ""}
              label={isRequired ? `${label} *` : label}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errorMessage && (
              <FormHelperText error>{errorMessage}</FormHelperText>
            )}
          </FormControl>
        );

      case "multiSelect":
        return (
          <FormControl
            variant="outlined"
            fullWidth
            error={Boolean(errorMessage)}
            disabled={isDisabled}
          >
            <InputLabel>{isRequired ? `${label} *` : label}</InputLabel>
            <Select
              {...field}
              multiple={type === "multiSelect"}
              value={field.value || (type === "multiSelect" ? [] : "")}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errorMessage && (
              <FormHelperText error>{errorMessage}</FormHelperText>
            )}
          </FormControl>
        );
      case "checkbox":
        return (
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value || false}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label={isRequired ? `${label} *` : label}
          />
        );
      default:
        return <TextField {...inputProps} type="text" />;
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      rules={{
        required: isRequired ? `${label} is required` : false,
        ...rules,
      }}
      render={({ field, fieldState: { error } }) => (
        <div>
          {renderInput({
            ...field,
            error: Boolean(error),
            helperText: error ? error.message : helperText,
          })}
        </div>
      )}
    />
  );
};
