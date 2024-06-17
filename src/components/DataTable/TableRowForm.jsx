import { Delete } from "@mui/icons-material";
import { Checkbox } from "@mui/material";
import { useState } from "react";

import RectangleIconButton from "../Buttons/RectangleIconButton";
import { CTableCell, CTableRow } from "../CTable";
import CellFormElementGenerator from "../ElementGenerators/CellFormElementGenerator";

const TableRowForm = ({
  onCheckboxChange,
  selected,
  onSelectedRowChange,
  checkboxValue,
  watch = () => {},
  row,
  onDeleteClick = () => {},
  formVisible,
  remove,
  control,
  currentPage,
  rowIndex,
  columns,
  tableSettings,
  tableSlug,
  setFormValue,
  pageName,
  calculateWidth,
  limit = 10,
}) => {
  const [showCheckbox, setShowCheckbox] = useState(false);

  return (
    <CTableRow>
      <CTableCell
        onMouseEnter={() => setShowCheckbox(true)}
        onMouseLeave={() => setShowCheckbox(false)}
        style={{ padding: 0, textAlign: "center" }}
      >
        {showCheckbox || !!selected.find((i) => i === row.guid) ? (
          <Checkbox
            onChange={(_, val) => onSelectedRowChange(val, row)}
            checked={!!selected.find((i) => i === row.guid)}
          />
        ) : (
          (currentPage - 1) * limit + rowIndex + 1
        )}
      </CTableCell>
      {onCheckboxChange && !formVisible && (
        <CTableCell>
          <Checkbox
            checked={checkboxValue === row.guid}
            onChange={(_, val) => onCheckboxChange(val, row)}
            onClick={(e) => e.stopPropagation()}
          />
        </CTableCell>
      )}
      {!formVisible && (
        <CTableCell align="center">
          {(currentPage - 1) * limit + rowIndex + 1}
        </CTableCell>
      )}
      {columns.map((column, index) => (
        <CTableCell
          key={column.id}
          className={`overflow-ellipsis editable_col`}
          style={{
            padding: 0,
            position: tableSettings?.[pageName]?.find(
              (item) => item?.id === column?.id
            )?.isStiky
              ? "sticky"
              : "relative",
            left: tableSettings?.[pageName]?.find(
              (item) => item?.id === column?.id
            )?.isStiky
              ? calculateWidth(column?.id, index)
              : "0",
            backgroundColor: "#fff",
            zIndex: tableSettings?.[pageName]?.find(
              (item) => item?.id === column?.id
            )?.isStiky
              ? "1"
              : "",
            minWidth: "max-content",
          }}
        >
          <CellFormElementGenerator
            selected={selected}
            tableSlug={tableSlug}
            watch={watch}
            fields={columns}
            field={column}
            row={row}
            index={rowIndex}
            control={control}
            setFormValue={setFormValue}
          />
        </CTableCell>
      ))}
      <CTableCell style={{ verticalAlign: "middle", padding: 0 }}>
        <RectangleIconButton
          color="error"
          onClick={() =>
            row.guid ? onDeleteClick(row, rowIndex) : remove(rowIndex)
          }
        >
          <Delete color="error" />
        </RectangleIconButton>
      </CTableCell>
    </CTableRow>
  );
};

export default TableRowForm;
