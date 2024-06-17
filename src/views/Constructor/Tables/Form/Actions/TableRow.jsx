import { Delete } from "@mui/icons-material";
import React, { useEffect, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import RectangleIconButton from "../../../../../components/Buttons/RectangleIconButton";
import HFMultipleSelect from "../../../../../components/FormElements/HFMultipleSelect";
import HFSelect from "../../../../../components/FormElements/HFSelect";
import HFTextField from "../../../../../components/FormElements/HFTextField";
import constructorObjectService from "../../../../../services/constructorObjectService";
import constructorRelationService from "../../../../../services/constructorRelationService";
import styles from "./style.module.scss";

function TableRow({
  summary,
  control,
  typeList,
  index,
  remove,
  update,
  slug,
  relation,
}) {
  const [relations, setRelations] = useState([]);
  const [data, setData] = useState([]);

  const selectedTableOptions = useWatch({
    control: control,
    name: `attributes.additional_parameters.${index}.table_slug`,
  });

  const getList = useMemo(() => {
    const relationsWithRelatedTableSlug = relations?.map((relation) => ({
      ...relation,
      relatedTableSlug:
        relation.table_to?.slug === slug ? "table_from" : "table_to",
    }));

    return relationsWithRelatedTableSlug
      ?.filter((relation) => {
        return !(
          (relation.type === "Many2One" &&
            relation.table_from?.slug === slug) ||
          (relation.type === "One2Many" && relation.table_to?.slug === slug) ||
          relation.type === "Recursive" ||
          (relation.type === "Many2Many" && relation.view_type === "INPUT") ||
          (relation.type === "Many2Dynamic" &&
            relation.table_from?.slug === slug)
        );
      })
      .map((relation) => ({
        label: relation.table_from.label,
        value: relation.table_from.slug,
        view:
          relation?.table_from.subtitle_field_slug ||
          relation?.table_to?.subtitle_field_slug,
      }));
  }, [relations, slug]);

  const getFilterData = useMemo(() => {
    return getList?.find((item) => {
      if (item?.value === selectedTableOptions) {
        return item;
      }
    });
  }, [getList, selectedTableOptions]);

  const valueList = useMemo(() => {
    return data?.map((item) => ({
      label: item?.[getFilterData?.view],
      value: item?.guid,
    }));
  }, [data, getFilterData]);

  // FUNCTIONS

  // Get data for Value
  const getRelations = () => {
    constructorRelationService
      .getList({
        table_slug: slug,
        relation_table_slug: slug,
      })
      .then((res) => {
        setRelations(res.relations);
      })
      .catch((a) => console.log("error", a));
  };

  const onUpdate = () => {
    update([...relation]);
  };

  // Delete function
  const deleteSummary = (index) => {
    remove(index);
  };

  useEffect(() => {
    if (selectedTableOptions) {
      selectedTableOptions &&
        constructorObjectService
          ?.getList(selectedTableOptions, {
            data: {
              limit: 10,
              offset: 0,
            },
          })
          .then((res) => {
            setData(res?.data?.response);
          });
    }
  }, [selectedTableOptions]);

  useEffect(() => {
    getRelations();
  }, []);

  return (
    <div key={summary.key} className={styles.tableActions}>
      <div className={styles.tableType}>
        <h4>Type:</h4>
        <div className={styles.tableType_select}>
          <HFSelect
            fullWidth
            control={control}
            options={typeList}
            name={`attributes.additional_parameters.${index}.type`}
            onChange={onUpdate}
          />
        </div>
      </div>
      {summary?.type !== "TABLE" && summary?.type !== "HARDCODE" && (
        <div className={styles.tableType}>
          <h4>Table:</h4>
          <div className={styles.tableType_select}>
            <HFSelect
              fullWidth
              control={control}
              options={getList}
              name={`attributes.additional_parameters.${index}.table_slug`}
            />
          </div>
        </div>
      )}
      <div className={styles.tableType}>
        <h4>Name:</h4>
        <div className={styles.tableType_select}>
          <HFTextField
            fullWidth
            control={control}
            options={typeList}
            name={`attributes.additional_parameters.${index}.name`}
          />
        </div>
      </div>
      <div className={styles.tableType}>
        <h4>Value:</h4>
        <div className={styles.tableType_select}>
          {summary?.type === "OBJECTID" ? (
            <HFMultipleSelect
              fullWidth
              control={control}
              options={valueList}
              name={`attributes.additional_parameters.${index}.value`}
            />
          ) : summary?.type === "TABLE" ? (
            <HFSelect
              fullWidth
              control={control}
              options={getList}
              name={`attributes.additional_parameters.${index}.value`}
            />
          ) : (
            <HFTextField
              fullWidth
              control={control}
              options={typeList}
              name={`attributes.additional_parameters.${index}.value`}
            />
          )}
        </div>
      </div>

      <div className={styles.deleteBtn}>
        <RectangleIconButton color="error" onClick={() => deleteSummary(index)}>
          <Delete color="error" />
        </RectangleIconButton>
      </div>
    </div>
  );
}

export default TableRow;
