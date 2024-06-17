import React, { useEffect, useMemo, useState } from "react";
import {
  CTable,
  CTableBody,
  CTableCell,
  CTableRow,
  CTableHead,
  CTableHeadCell,
  CTableHeadRow,
} from "../../../../components/CTable";
import FRow from "../../../../components/FormElements/FRow";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import HFSelect from "../../../../components/FormElements/HFSelect";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import style from "./style.module.scss";
import { useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import clientRelationService from "../../../../services/auth/clientRelationService";
import constructorRelationService from "../../../../services/constructorRelationService";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import constructorFieldService from "../../../../services/constructorFieldService";
import RemoveIcon from "@mui/icons-material/Remove";
import { generateID } from "../../../../utils/generateID";
import { IconButton, Modal } from "@mui/material";
import FinancialTreeBody from "@/views/Objects/components/ViewSettings/FinancialTreeBody";
import FinancialFilterModal from "@/views/Objects/components/ViewSettings/FinancialFilterModal";
import ViewSettings from "@/views/Objects/components/ViewSettings/index";
import Popover from "@mui/material/Popover";
import styles from "@/views/Objects/components/ViewSettings/style.module.scss";
import { Add, Close } from "@mui/icons-material";
import HFMultipleSelect from "@/components/FormElements/HFMultipleSelect";

const FinancialTableRow = ({
  form,
  item,
  objectList = [],
  level = 1,
  setObjectList,
  viewId,
  indexMap,
  indexParent,
  key,
}) => {
  const groupby = useWatch({
    control: form.control,
    name: `chartOfAccounts.form_fields.selected_fields.${indexParent}`,
  });

  const [expanded, setExpanded] = useState(false);
  const [relations, setRelations] = useState([]);
  const [digitalAreas, setDigitalAreas] = useState([]);
  const [dateAreas, setDateAreas] = useState([]);
  const { tableSlug } = useParams();
  const [modalShow, setModalShow] = useState(false);
  const [thisIndex, setThisIndex] = useState();
  const [filterFieldArea, setFilterFieldArea] = useState([]);
  let optionIndex = 0;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const optionsType = [
    {
      label: "Кредет",
      value: "credit",
    },
    {
      label: "Дебет",
      value: "debet",
    },
  ];

  const children = useMemo(() => {
    return objectList.filter((el) => el[`${tableSlug}_id`] === item.guid);
  }, [objectList, tableSlug, item]);

  const getRelations = () => {
    constructorRelationService
      .getList({
        table_slug: tableSlug,
      })
      .then((res) => {
        setRelations(res.relations);
      })
      .catch((a) => console.log("error", a));
  };

  useEffect(() => {
    getRelations();
  }, []);

  const tableOptions = useMemo(() => {
    const relationsWithRelatedTableSlug = relations?.map((relation) => ({
      ...relation,
      relatedTableSlug:
        relation.table_to?.slug === tableSlug ? "table_from" : "table_to",
    }));

    return relationsWithRelatedTableSlug
      ?.filter((relation) => {
        return !(
          (relation.type === "Many2One" &&
            relation.table_from?.slug === tableSlug) ||
          (relation.type === "One2Many" &&
            relation.table_to?.slug === tableSlug) ||
          relation.type === "Recursive" ||
          (relation.type === "Many2Many" && relation.view_type === "INPUT") ||
          (relation.type === "Many2Dynamic" &&
            relation.table_from?.slug === tableSlug)
        );
      })
      .map((relation) => ({
        label: relation.table_from.label,
        value: relation.table_from.slug,
      }));
  }, [relations, tableSlug]);

  const selectedTableOptions = useWatch({
    control: form.control,
    name: `chartOfAccounts.${indexParent}.${item.guid}.${optionIndex}.table_slug`,
  });

  useEffect(() => {
    selectedTableOptions &&
      constructorFieldService
        .getList({
          table_slug: selectedTableOptions,
        })
        .then((res) => {
          setDigitalAreas(
            res.fields
              .filter(
                (item) => item.type === "NUMBER" || item.type === "FORMULA"
              )
              .map((item) => ({
                label: item.label,
                value: item.slug,
              }))
          );
          setDateAreas(
            res.fields
              .filter(
                (item) => item.type === "DATE" || item.type === "DATE_TIME"
              )
              .map((item) => ({
                label: item.label,
                value: item.slug,
              }))
          );
          setFilterFieldArea(
            res.fields.map((item) => ({
              label: item.label,
              value: item.slug,
            }))
          );
        })
        .catch((a) => console.log("error", a));
  }, [selectedTableOptions]);

  const addRow = () => {
    setObjectList([...objectList, { ...item, name: "", idGuid: generateID() }]);
  };

  const removeRow = () => {
    setObjectList(objectList.filter((field) => field.idGuid !== item.idGuid));
  };

  const {
    fields: chartChild,
    append,
    replace,
    remove,
  } = useFieldArray({
    control: form.control,
    name: `chartOfAccounts.${indexParent}.${item.guid}`,
    keyName: "key",
  });
  useEffect(() => {
    if (chartChild.length === 0) {
      replace([
        {
          table_slug: "",
          type: "",
          number_field: "",
          date_field: "",
          id: generateID(),
        },
      ]);
    }
  }, []);

  const removeChild = (index) => {
    remove(index);
  };

  return (
    <>
      {chartChild.map((childItem, optionIndex) => (
        <CTableRow key={childItem.id}>
          <CTableCell>
            <div className={style.wrapper}>
              <div className={style.title}>
                {<div style={{ marginRight: `${10 * level}px` }} />}
                {children?.length ? (
                  <button onClick={() => setExpanded(!expanded)}>
                    <KeyboardArrowDownRoundedIcon />
                  </button>
                ) : (
                  ""
                )}
                {optionIndex !== 0 ? "" : item.name}
              </div>

              {optionIndex === 0 ? (
                <button
                  className={style.addIcon}
                  onClick={() =>
                    append({
                      id: generateID(),
                      table_slug: "",
                      type: "",
                      number_field: "",
                      date_field: "",
                    })
                  }
                >
                  <AddIcon />
                </button>
              ) : (
                ""
              )}

              {optionIndex !== 0 ? (
                <button
                  className={style.addIcon}
                  onClick={() => removeChild(optionIndex)}
                >
                  <RemoveIcon style={{ color: "#B72136" }} />
                </button>
              ) : (
                ""
              )}
            </div>
          </CTableCell>
          <CTableCell>
            {!children?.length ? (
              <HFSelect
                fullWidth
                control={form.control}
                options={optionsType}
                name={`chartOfAccounts.${indexParent}.${item.guid}.${optionIndex}.type`}
              />
            ) : (
              ""
            )}
          </CTableCell>
          <CTableCell>
            {!children?.length ? (
              <HFSelect
                fullWidth
                control={form.control}
                options={tableOptions}
                name={`chartOfAccounts.${indexParent}.${item.guid}.${optionIndex}.table_slug`}
              />
            ) : (
              ""
            )}
          </CTableCell>
          <CTableCell>
            {!children?.length ? (
              <HFSelect
                fullWidth
                control={form.control}
                options={digitalAreas}
                name={`chartOfAccounts.${indexParent}.${item.guid}.${optionIndex}.number_field`}
              />
            ) : (
              ""
            )}
          </CTableCell>
          <CTableCell>
            {!children?.length ? (
              <HFSelect
                fullWidth
                control={form.control}
                options={dateAreas}
                name={`chartOfAccounts.${indexParent}.${item.guid}.${optionIndex}.date_field`}
              />
            ) : (
              ""
            )}
          </CTableCell>

          <FinancialFilterModal
            form={form}
            viewId={viewId}
            indexParent={indexParent}
            item={item}
            children={children}
            optionIndex={optionIndex}
            filterFieldArea={filterFieldArea}
          />
        </CTableRow>
      ))}
    </>
  );
};

export default FinancialTableRow;
