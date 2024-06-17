import { Close } from "@mui/icons-material";
import { Divider, IconButton } from "@mui/material";
import { useMemo } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import PrimaryButton from "../../../../components/Buttons/PrimaryButton";
import FormElementGenerator from "../../../../components/ElementGenerators/FormElementGenerator";
import ManyToManyRelationFormElement from "../../../../components/ElementGenerators/ManyToManyRelationFormElement";
import HFMultipleCalendar from "../../../../components/FormElements/HFMultipleCalendar";
import RingLoaderWithWrapper from "../../../../components/Loaders/RingLoader/RingLoaderWithWrapper";
import constructorObjectService from "../../../../services/constructorObjectService";
import constructorSectionService from "../../../../services/constructorSectionService";
import { sortSections } from "../../../../utils/sectionsOrderNumber";
import styles from "./style.module.scss";

const Form = ({ view = {}, onClose, tableSlug }) => {
  const [btnLoader, setBtnLoader] = useState(false);
  const queryClient = useQueryClient();

  const { handleSubmit, control } = useForm({
    defaultValues: {},
  });

  const { isLoading, data: sections = [] } = useQuery(
    ["GET_SECTIONS", tableSlug],
    () => {
      return constructorSectionService.getList({
        table_slug: tableSlug,
      });
    },
    {
      select: ({ sections }) => sortSections(sections),
      enabled: !!tableSlug,
    }
  );

  const { fields = [], multipleInsertField = {} } = useMemo(() => {
    const fields = [];
    let multipleInsertField = {};

    sections?.forEach((section) =>
      section.fields?.forEach((field) => {
        if (
          field.slug === view.multiple_insert_field ||
          `${field.id?.split("#")[0]}_id` === view.multiple_insert_field
        )
          multipleInsertField = field;
        else fields.push(field);
      })
    );

    return {
      fields,
      multipleInsertField,
    };
  }, [sections, view]);

  const onSubmit = async (values) => {
    setBtnLoader(true);

    try {
      const computedData = values?.multiple_values?.map((el) => ({
        ...values,
        [view.multiple_insert_field]: el,
      }));

      const data = {
        data: { objects: computedData },
        updated_fields: view.updated_fields,
      };

      await constructorObjectService.updateMultiple(tableSlug, data);

      onClose();

      queryClient.refetchQueries([
        "GET_OBJECTS_LIST_WITH_RELATIONS",
        { tableSlug },
      ]);
      queryClient.refetchQueries(["GET_OBJECTS_LIST", { tableSlug }]);
    } catch (error) {
      setBtnLoader(false);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Multiple insert</h2>

        <IconButton className={styles.closeButton} onClick={onClose}>
          <Close className={styles.closeIcon} />
        </IconButton>
      </div>

      <div className={styles.body}>
        {isLoading ? (
          <RingLoaderWithWrapper />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {multipleInsertField?.type === "DATE" ? (
              <HFMultipleCalendar control={control} name="multiple_dates" />
            ) : (
              <ManyToManyRelationFormElement
                control={control}
                field={multipleInsertField}
                name={"multiple_values"}
              />
            )}

            <Divider className="my-2" />

            {fields.map((field) => (
              <FormElementGenerator
                key={field.id}
                field={field}
                control={control}
              />
            ))}
          </form>
        )}
      </div>

      <div className={styles.footer}>
        <PrimaryButton
          size="large"
          className={styles.button}
          onClick={handleSubmit(onSubmit)}
          loader={btnLoader}
        >
          Сохранить
        </PrimaryButton>
      </div>
    </>
  );
};

export default Form;
