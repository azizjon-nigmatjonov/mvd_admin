import { PictureAsPdf, Print } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { forwardRef, useMemo, useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Footer from "../../../components/Footer";
import HFAutoWidthInput from "../../../components/FormElements/HFAutoWidthInput";
import usePaperSize from "../../../hooks/usePaperSize";
import constructorObjectService from "../../../services/constructorObjectService";
import documentTemplateService from "../../../services/documentTemplateService";
import DropdownButton from "../components/DropdownButton";
import DropdownButtonItem from "../components/DropdownButton/DropdownButtonItem";
import Redactor from "./Redactor";
import styles from "./style.module.scss";
import { useQueryClient } from "react-query";

const RedactorBlock = forwardRef(
  (
    {
      templateFields,
      selectedObject,
      selectedTemplate,
      setSelectedTemplate,
      updateTemplate,
      addNewTemplate,
      tableViewIsActive,
      fields,
      selectedPaperSizeIndex,
      setSelectedPaperSizeIndex,
      exportToPDF,
      exportToHTML,
      htmlLoader,
      pdfLoader,
      print,
    },
    redactorRef
  ) => {
    const { tableSlug } = useParams();
    const { control, handleSubmit, reset } = useForm();
    const [btnLoader, setBtnLoader] = useState(false);
    const loginTableSlug = useSelector((state) => state.auth.loginTableSlug);
    const userId = useSelector((state) => state.auth.userId);
    const queryClient = useQueryClient();
    const {
      selectedPaperSize,
      selectPaperIndexBySize,
      selectPaperIndexByName,
    } = usePaperSize(selectedPaperSizeIndex);

    const getFilteredData = useMemo(() => {
      return templateFields
        .filter((i) => i.type === "LOOKUP")
        .find((i) => i.table_slug === tableSlug);
    }, [templateFields, tableSlug]);

    useEffect(() => {
      reset({
        ...selectedTemplate,
        html: selectedTemplate.html,
      });
      setSelectedPaperSizeIndex(
        selectPaperIndexByName(selectedTemplate.size?.[0])
      );
    }, [
      selectedTemplate,
      reset,
      setSelectedPaperSizeIndex,
      selectPaperIndexByName,
    ]);

    const onSubmit = async (values) => {
      try {
        setBtnLoader(true);

        const savedData = redactorRef.current.getData();
        const data = {
          ...values,
          object_id: values?.objectId ?? "",
          html: savedData ?? "",
          size: [selectedPaperSize.name],
          title: values.title,
          table_slug: tableSlug,
          [getFilteredData?.slug]: selectedObject ?? undefined,
        };

        if (loginTableSlug && values.type === "CREATE") {
          data[`${loginTableSlug}_ids`] = [userId];
        }

        if (values.type !== "CREATE") {
          await constructorObjectService.update("template", { data });
          updateTemplate(data);
        } else {
          const res = await constructorObjectService.create("template", {
            data,
          });
          addNewTemplate(res);
        }

        setSelectedTemplate(null);
        queryClient.refetchQueries("GET_OBJECT_LIST", { tableSlug });
      } catch (error) {
        console.log(error);
        setBtnLoader(false);
      }
    };

    return (
      <div
        className={`${styles.redactorBlock} ${
          tableViewIsActive ? styles.hidden : ""
        }`}
      >
        <div
          className={styles.pageBlock}
          // style={{ width: selectedPaperSize.width + 'pt' }}
        >
          <div className={styles.templateName}>
            <HFAutoWidthInput
              control={control}
              name="title"
              inputStyle={{ fontSize: 20 }}
            />
          </div>

          <div className={styles.pageSize}>
            {selectedPaperSize.name} ({selectedPaperSize.width} x{" "}
            {selectedPaperSize.height})
          </div>

          <Redactor
            ref={redactorRef}
            control={control}
            fields={fields}
            selectedPaperSizeIndex={selectedPaperSizeIndex}
          />
        </div>

        <Footer
          extra={
            <>
              <div
                onClick={handleSubmit(onSubmit)}
                className={styles.saveButton}
              >
                {btnLoader && <CircularProgress color="secondary" size={15} />}
                Save
              </div>
              <DropdownButton
                onClick={exportToHTML}
                loader={pdfLoader || htmlLoader}
                text="Generate and edit"
              >
                <DropdownButtonItem onClick={exportToPDF}>
                  <PictureAsPdf />
                  Generate PDF
                </DropdownButtonItem>
                <DropdownButtonItem onClick={print}>
                  <Print />
                  Print
                </DropdownButtonItem>
              </DropdownButton>
            </>
          }
        />
      </div>
    );
  }
);

export default RedactorBlock;
