import { CTableCell } from "../CTable";
import CellFormElementGenerator from "../ElementGenerators/CellFormElementGenerator";
import "./style.scss";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";

const MultipleUpdateRow = ({
  columns,
  fields,
  selected,
  watch,
  control,
  setFormValue,
}) => {
  return (
    <tr className="multipleRow">
      <CTableCell
        style={{
          padding: 0,
          color: "#fff",
          textAlign: "center",
        }}
      >
        <BorderColorOutlinedIcon style={{ paddingBottom: 3 }} />
      </CTableCell>

      {fields.map((field, index) => (
        <CTableCell
          key={field.id}
          style={{
            padding: 0,
          }}
        >
          <CellFormElementGenerator
            isBlackBg
            columns={columns}
            selected={selected}
            index={index}
            watch={watch}
            control={control}
            setFormValue={setFormValue}
            field={{ ...field, required: false }}
            row={{}}
          />
        </CTableCell>
      ))}
    </tr>
  );
};

export default MultipleUpdateRow;
