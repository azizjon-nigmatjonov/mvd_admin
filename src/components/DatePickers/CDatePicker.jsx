import DatePicker from "react-multi-date-picker";
import weekends from "react-multi-date-picker/plugins/highlight_weekends";
import {InputAdornment, TextField} from "@mui/material";
import "react-multi-date-picker/styles/layouts/mobile.css";
import {Today} from "@mui/icons-material";
import {locale} from "./Plugins/locale";
import "./style2.scss";
import CustomNavButton from "./Plugins/CustomNavButton";
import InputMask from "react-input-mask";
import {useRef} from "react";

const CDatePicker = ({
                         value,
                         onChange,
                         disabled,
                         isBlackBg,
                         isFormEdit,
                         mask,
                         tabIndex,
                         classes,
                         placeholder,
                     }) => {

    const datePickerRef = useRef()
    return (
        <DatePicker
            disabled={disabled}
            ref={datePickerRef}
            render={(value, openCalendar, handleChange) => {
                document.addEventListener('keydown', (e) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        datePickerRef.current.closeCalendar()
                    }
                });
                return (
                        <InputMask
                            mask={mask}
                            value={value ?? undefined}
                            onChange={handleChange}
                            disabled={disabled}
                        >
                            {(InputProps) => (
                                <TextField
                                    size="small"
                                    name={name}
                                    placeholder={placeholder}
                                    inputFormat="dd.MM.yyyy"
                                    onClick={openCalendar}
                                    fullWidth
                                    autoComplete="off"
                                    autoFocus={tabIndex === 1}
                                    InputProps={{
                                        ...InputProps,
                                        inputProps: { tabIndex },
                                        readOnly: disabled,
                                        classes: {
                                            input: isBlackBg ? classes.input : "",
                                        },
                                        style: disabled
                                            ? {
                                                background: "#c0c0c039",
                                            }
                                            : {
                                                background: isBlackBg ? "#2A2D34" : "",
                                                color: isBlackBg ? "#fff" : "",
                                            },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Today style={{color: isBlackBg ? "#fff" : ""}}/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    className={isFormEdit ? "custom_textfield" : ""}
                                />
                            )}
                        </InputMask>
                );
            }}
            renderButton={<CustomNavButton/>}
            // animations={[opacity()]}
            plugins={[weekends()]}
            weekStartDayIndex={1}
            portal
            locale={locale}
            className="datePicker"
            format="DD.MM.YYYY"
            inputFormat="dd.MM.yyyy"
            value={new Date(value) || ""}
            onChange={(val) => onChange(val ? new Date(val) : "")}
        />
    );
};

export default CDatePicker;
