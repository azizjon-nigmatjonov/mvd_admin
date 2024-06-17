import React, { useState, useEffect, useMemo } from "react";
import constructorObjectService from "../../services/constructorObjectService";
import { get } from "@ngard/tiny-get";
import CascadingMany2Many from "./CascadingMany2Many";
import CascadingMany2One from "./CascadingMany2One";

function CascadingItem({
  fields,
  field,
  level = 1,
  handleClose,
  currentLevel,
  setCurrentLevel,
  setValue,
  title,
  setTitle,
  setInputValue,
  tableSlug,
  setFormValue,
  index,
  dataFilter,
  setDataFilter,
  tablesSlug,
  setTablesSlug,
}) {
  const [value, setValues] = useState();
  const [searchText, setSearchText] = useState("");
  const [levelSlug, setLevelSlug] = useState("");
  const [levelTableSlug, setLevelTableSlug] = useState("");
  const [ids, setIds] = useState([]);

  // Search filter
  const foundServices = useMemo(() => {
    if (!searchText) return [];
    return field.filter(
      (item) =>
        item?.name?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
        item?.email?.toLowerCase()?.includes(searchText?.toLowerCase())
    );
  }, [searchText, field]);

  // Data for service filter
  const dataObject = useMemo(() => {
    const values = {};
    tablesSlug?.map((item, index) => {
      values[`${item}_id`] = dataFilter[index];
      values[`${item}_ids`] = dataFilter[index];
    });
    return values;
  }, [tablesSlug, dataFilter]);

  const handleClick = (item) => {
    if (currentLevel === 4 && fields?.type === "LOOKUP") {
      setValue(item?.guid);
      setInputValue(item);

      fields?.attributes?.autofill.forEach(({ field_from, field_to }) => {
        setFormValue(`multi.${index}.${field_to}`, get(item, field_from));
      });
      handleClose();
    }
    if (level < 4) {
      setDataFilter([...new Set(dataFilter), item?.guid]);
      setTitle([...title, item?.name]);

      const data =
        currentLevel === 3
          ? dataObject
          : {
              [levelSlug]: item?.guid,
            };
      constructorObjectService
        .getList(levelTableSlug, {
          data: data,
        })
        .then((res) => {
          setValues(res?.data?.response);
          setTablesSlug([...tablesSlug, res?.table_slug]);
          setCurrentLevel(level + 1);
        })
        .catch((err) => {
          console.log("cascading error", err);
        });
    }
  };

  const backArrowButton = () => {
    setCurrentLevel(currentLevel - 1);
    setTablesSlug(tablesSlug.splice(0, tablesSlug.length - 1));
    setDataFilter(dataFilter.splice(0, dataFilter.length - 1));
    setTitle(title.splice(0, title?.length - 1));
  };

  // Many2Many confirm function
  const confirmButton = () => {
    setValue(ids);
    handleClose();
  };

  // Checkbox function Many2Many
  const onChecked = (id) => {
    setIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((items) => items !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  useEffect(() => {
    if (fields?.attributes?.cascadings?.length === 4) {
      if (currentLevel === 1) {
        setLevelSlug(fields?.attributes.cascadings[3].field_slug);
        setLevelTableSlug(fields?.attributes.cascadings[2]?.table_slug);
      } else if (currentLevel === 2) {
        setLevelSlug(fields?.attributes.cascadings[2].field_slug);
        setLevelTableSlug(fields?.attributes.cascadings[1]?.table_slug);
      } else if (currentLevel === 3) {
        setLevelSlug(fields?.attributes.cascadings[1].field_slug);
        setLevelTableSlug(fields?.attributes.cascadings[0]?.table_slug);
      } else if (currentLevel === 4) {
        setLevelSlug(fields?.attributes.cascadings[0].field_slug);
      }
    }
  }, [fields, currentLevel]);

  return (
    <>
      {fields?.type === "LOOKUPS"
        ? currentLevel === level && (
            <CascadingMany2Many
              backArrowButton={backArrowButton}
              level={level}
              fields={fields}
              title={title}
              searchText={searchText}
              currentLevel={currentLevel}
              handleClick={handleClick}
              foundServices={foundServices}
              setSearchText={setSearchText}
              field={field}
              confirmButton={confirmButton}
              onChecked={onChecked}
            />
          )
        : currentLevel === level && (
            <CascadingMany2One
              backArrowButton={backArrowButton}
              level={level}
              title={title}
              searchText={searchText}
              setSearchText={searchText}
              field={field}
              fields={fields}
              foundServices={foundServices}
              currentLevel={currentLevel}
              handleClick={handleClick}
            />
          )}
      {level < 4 && value && (
        <CascadingItem
          fields={fields}
          field={value}
          level={level + 1}
          handleClose={handleClose}
          currentLevel={currentLevel}
          setCurrentLevel={setCurrentLevel}
          setValue={setValue}
          searchText={searchText}
          foundServices={foundServices}
          title={title}
          setTitle={setTitle}
          setInputValue={setInputValue}
          tableSlug={tableSlug}
          setFormValue={setFormValue}
          index={index}
          dataFilter={dataFilter}
          setDataFilter={setDataFilter}
          tablesSlug={tablesSlug}
          setTablesSlug={setTablesSlug}
        />
      )}
    </>
  );
}

export default CascadingItem;
