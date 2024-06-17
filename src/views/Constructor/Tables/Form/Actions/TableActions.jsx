import React, { useEffect, useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import styles from "./style.module.scss";
import constructorRelationService from "../../../../../services/constructorRelationService";
import constructorObjectService from "../../../../../services/constructorObjectService";
import { useMemo } from "react";
import TableRow from "./TableRow";

function TableActions({ control, typeList, slug }) {
  const {
    fields: relation,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: "attributes.additional_parameters",
    keyName: "key",
  });

  const addNewSummary = () => {
    append({
      key: "row_click_action",
      value: "",
    });
  };

  return (
    <>
      <div className={styles.settingsBlockHeader}>
        <h2>Settings</h2>
      </div>

      <div className="p-2">
        <div className={styles.actionSettingBlock}>
          {relation?.map((summary, index) => (
            <TableRow
              summary={summary}
              control={control}
              index={index}
              update={update}
              remove={remove}
              slug={slug}
              relation={relation}
              typeList={typeList}
            />
          ))}
        </div>

        <div className={styles.summaryButton} onClick={addNewSummary}>
          <button type="button">+ Создать новый</button>
        </div>
      </div>
    </>
  );
}

export default TableActions;
