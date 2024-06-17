import { TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Controller } from "react-hook-form";

const useStyles = makeStyles((theme) => ({
  input: {
    "&::placeholder": {
      color: "#fff",
    },
  },
}));

const HFTextField = ({
  control,
  name = "",
  isFormEdit = false,
  isBlackBg,
  disabledHelperText = false,
  required = false,
  fullWidth = false,
  withTrim = false,
  rules = {},
  defaultValue = "",
  disabled,
  tabIndex,
  placeholder,
  ...props
}) => {
  const classes = useStyles();
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      rules={{
        required: required ? "This is required field" : false,
        ...rules,
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextField
          size="small"
          value={value}
          onChange={(e) => {
            onChange(withTrim ? e.target.value?.trim() : e.target.value);
          }}
          name={name}
          error={error}
          fullWidth={fullWidth}
          placeholder={placeholder}
          autoFocus={tabIndex === 1}
          InputProps={{
            readOnly: disabled,
            inputProps: { tabIndex },
            classes: {
              input: isBlackBg ? classes.input : "",
            },
            style: disabled
              ? {
                  background: "#c0c0c039",
                }
              : {
                  background: isBlackBg ? "#2A2D34" : "inherit",
                  color: isBlackBg ? "#fff" : "inherit",
                },
          }}
          helperText={!disabledHelperText && error?.message}
          className={isFormEdit ? "custom_textfield" : ""}
          {...props}
        />
      )}
    ></Controller>
  );
};

export default HFTextField;
