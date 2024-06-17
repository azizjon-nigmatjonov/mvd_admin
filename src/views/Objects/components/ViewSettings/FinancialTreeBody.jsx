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
import { Modal } from "@mui/material";
import FinancialTableRow from "@/views/Objects/components/ViewSettings/TableRow";

const FinancialTreeBody = ({
  form,
  item,
  objectList = [],
  level = 1,
  setObjectList,
  viewId,
  indexMap,
  indexParent,
  key,
  groupby,
  relations,
}) => {
  const [expanded, setExpanded] = useState(false);

  const [digitalAreas, setDigitalAreas] = useState([]);
  const [dateAreas, setDateAreas] = useState([]);
  const { tableSlug } = useParams();
  const [modalShow, setModalShow] = useState(false);
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
    name: `chartOfAccounts.${indexParent}.${item.guid}.${indexMap}.table_slug`,
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
        })
        .catch((a) => console.log("error", a));
  }, [selectedTableOptions]);

  const addRow = () => {
    setObjectList([...objectList, { ...item, name: "", idGuid: generateID() }]);
  };

  const removeRow = () => {
    setObjectList(objectList.filter((field) => field.idGuid !== item.idGuid));
  };

  if (!children.length) {
    return (
      <FinancialTableRow
        item={item}
        form={form}
        viewId={viewId}
        objectList={objectList}
        key={item.guid}
        level={level + 1}
        indexParent={indexParent}
        indexMap={indexMap}
        setObjectList={setObjectList}
      />
    );
  }

  return (
    <>
      <CTableRow key={item.guid}>
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
              {item.name}
            </div>

            {!children?.length && item.name ? (
              <button className={style.addIcon} onClick={() => addRow()}>
                <AddIcon />
              </button>
            ) : (
              ""
            )}

            {!children?.length && !item.name ? (
              <button className={style.addIcon} onClick={() => removeRow()}>
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
              name={`chartOfAccounts.${indexParent}.${item.guid}.${indexMap}.type`}
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
              name={`chartOfAccounts.${indexParent}.${item.guid}.${indexMap}.table_slug`}
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
              onChange={(e) => form.setValue("digitalArea", [e])}
              name={`chartOfAccounts.${indexParent}.${item.guid}.${indexMap}.number_field`}
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
              name={`chartOfAccounts.${indexParent}.${item.guid}.${indexMap}.date_field`}
            />
          ) : (
            ""
          )}
        </CTableCell>
        <CTableCell>
          {!children?.length ? (
            <div className={style.filter}>
              <button name="filters" onClick={() => setModalShow(true)}>
                <FilterAltIcon />
              </button>
            </div>
          ) : (
            ""
          )}
        </CTableCell>
      </CTableRow>
      {expanded &&
        children.map((item, index) => (
          <FinancialTreeBody
            item={item}
            form={form}
            viewId={viewId}
            objectList={objectList}
            key={item.guid}
            level={level + 1}
            indexParent={indexParent}
            indexMap={index}
            setObjectList={setObjectList}
            groupby={groupby}
            relations={relations}
          />
        ))}
    </>
  );
};

export default FinancialTreeBody;
