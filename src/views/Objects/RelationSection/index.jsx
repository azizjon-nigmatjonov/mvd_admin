import { Add, Clear, Edit, Save } from "@mui/icons-material";
import { Card } from "@mui/material";
import { useCallback, useMemo, useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import RectangleIconButton from "../../../components/Buttons/RectangleIconButton";
import SecondaryButton from "../../../components/Buttons/SecondaryButton";
import IconGenerator from "../../../components/IconPicker/IconGenerator";
import constructorObjectService from "../../../services/constructorObjectService";
import CustomActionsButton from "../components/CustomActionsButton";
import FilesSection from "../FilesSection";
import ManyToManyRelationCreateModal from "./ManyToManyRelationCreateModal";
import RelationTable from "./RelationTable";
import styles from "./style.module.scss";
import DocumentGeneratorButton from "../components/DocumentGeneratorButton";
import style from "@/views/Objects/style.module.scss";
import { CheckIcon, UploadIcon } from "@/assets/icons/icon";
import { useDispatch, useSelector } from "react-redux";
import { tableSizeAction } from "@/store/tableSize/tableSizeSlice";
import FormatLineSpacingIcon from "@mui/icons-material/FormatLineSpacing";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExcelButtons from "@/views/Objects/components/ExcelButtons";
import ExcelDownloadButton from "@/views/Objects/components/ExcelButtons/ExcelDownloadButton";
import ExcelUploadButton from "@/views/Objects/components/ExcelButtons/ExcelUploadButton";
import MultipleInsertButton from "@/views/Objects/components/MultipleInsertForm";
import { addMinutes } from "date-fns";

const RelationSection = ({
  relations,
  tableSlug: tableSlugFromProps,
  id: idFromProps,
}) => {
  const filteredRelations = useMemo(() => {
    return relations?.filter((relation) => relation?.relatedTable);
  }, [relations]);
  const { tableSlug: tableSlugFromParams, id: idFromParams } = useParams();

  const tableSlug = tableSlugFromProps ?? tableSlugFromParams;
  const id = idFromProps ?? idFromParams;

  const [selectedManyToManyRelation, setSelectedManyToManyRelation] =
    useState(null);
  const [relationsCreateFormVisible, setRelationsCreateFormVisible] = useState(
    {}
  );
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [shouldGet, setShouldGet] = useState(false);
  const [fieldSlug, setFieldSlug] = useState("");
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [dataLength, setDataLength] = useState(0);
  const [heightControl, setHeightControl] = useState(false);
  const [moreShowButton, setMoreShowButton] = useState(false);
  const tableHeight = useSelector((state) => state.tableSize.tableHeight);
  let [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const queryTab = searchParams.get("tab");
  const myRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    queryTab
      ? setSelectedTabIndex(parseInt(queryTab) - 1)
      : setSelectedTabIndex(0);
  }, [queryTab]);

  const handleHeightControl = (val) => {
    dispatch(
      tableSizeAction.setTableHeight({
        tableHeight: val,
      })
    );
    setHeightControl(false);
  };

  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue: setFormValue,
  } = useForm({
    defaultValues: {
      [`${tableSlug}_id`]: id,
      multi: [],
    },
  });

  const { fields, remove, append, update } = useFieldArray({
    control,
    name: "multi",
  });

  useEffect(() => {
    update();
  }, []);

  const selectedRelation = filteredRelations[selectedTabIndex];

  useEffect(() => {
    setSelectedObjects([]);
    setFormVisible(false);
  }, [selectedTabIndex]);

  useEffect(() => {
    const result = {};

    filteredRelations?.forEach((relation) => (result[relation.id] = false));

    setRelationsCreateFormVisible(result);
  }, [filteredRelations]);

  const setCreateFormVisible = (relationId, value) => {
    setRelationsCreateFormVisible((prev) => ({
      ...prev,
      [relationId]: value,
    }));
  };

  const navigateToCreatePage = () => {
    const relation = filteredRelations[selectedTabIndex];
    if (relation.type === "Many2Many") setSelectedManyToManyRelation(relation);
    else {
      append({ [`${tableSlug}_id`]: idFromParams ?? "" });
      setFormVisible(true);

      // if (relation.is_editable) setCreateFormVisible(relation.id, true)
      // else {
      //   const relatedTable =
      //     relation.table_to?.slug === tableSlug
      //       ? relation.table_from
      //       : relation.table_to

      //   navigateToForm(relatedTable.slug, "CREATE", null, {
      //     [`${tableSlug}_id`]: id,
      //   })
      // }
    }
  };

  const getValue = useCallback((item, key) => {
    return typeof !item?.[key] === "object" ? item?.[key].value : item?.[key];
  }, []);

  const tableHeightOptions = [
    {
      label: "Small",
      value: "small",
    },
    {
      label: "Medium",
      value: "medium",
    },
    {
      label: "Large",
      value: "large",
    },
  ];

  const { mutate: updateMultipleObject } = useMutation(
    (values) =>
      constructorObjectService.updateMultipleObject(
        relations[selectedTabIndex]?.relatedTable,
        {
          data: {
            objects: values.multi.map((item) => ({
              ...item,
              guid: item?.guid ?? "",
              doctors_id_2: getValue(item, "doctors_id_2"),
              doctors_id_3: getValue(item, "doctors_id_3"),
              specialities_id: getValue(item, "specialities_id"),
              [fieldSlug]: id,
            })),
          },
        }
      ),
    {
      onSuccess: () => {
        setShouldGet((p) => !p);
        setFormVisible(false);
      },
    }
  );
  const onSubmit = (data) => {
    updateMultipleObject(data);
    navigate("/reload", {
      state: {
        redirectUrl: window.location.pathname,
      },
    });
  };

  if (!filteredRelations?.length) return null;

  return (
    <>
      {selectedManyToManyRelation && (
        <ManyToManyRelationCreateModal
          relation={selectedManyToManyRelation}
          closeModal={() => setSelectedManyToManyRelation(null)}
        />
      )}
      {filteredRelations.length ? (
        <Card className={styles.card}>
          <Tabs
            selectedIndex={selectedTabIndex}
            onSelect={(index) => setSelectedTabIndex(index)}
          >
            <div className={styles.cardHeader}>
              <TabList className={styles.tabList}>
                {filteredRelations?.map((relation, index) =>
                  relation?.permission &&
                  relation.permission?.view_permission === true ? (
                    <Tab key={index}>
                      {/* {relation?.view_relation_type === "FILE" ? (
                      <>
                        <InsertDriveFile /> Файлы
                      </>
                    ) : ( */}
                      <div className="flex align-center gap-2 text-nowrap">
                        <IconGenerator icon={relation?.icon} /> {relation.title}
                      </div>
                      {/* )} */}
                    </Tab>
                  ) : (
                    ""
                  )
                )}
              </TabList>

              <div className="flex gap-2">
                <CustomActionsButton
                  tableSlug={selectedRelation?.relatedTable}
                  selectedObjects={selectedObjects}
                  setSelectedObjects={setSelectedObjects}
                />
                <RectangleIconButton
                  color="success"
                  size="small"
                  onClick={navigateToCreatePage}
                  disabled={!id}
                >
                  <Add style={{ color: "#007AFF" }} />
                </RectangleIconButton>

                {/*<RectangleIconButton
                    color="white"
                    onClick={() => setHeightControl(!heightControl)}
                >
                  <div style={{position: "relative"}}>
                  <span
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                  >
                    <FormatLineSpacingIcon color="primary"/>
                  </span>
                    {heightControl && (
                        <div className={style.heightControl}>
                          {tableHeightOptions.map((el) => (
                              <div
                                  key={el.value}
                                  className={style.heightControl_item}
                                  onClick={() => handleHeightControl(el.value)}
                              >
                                {el.label}
                                {tableHeight === el.value ? <CheckIcon color="primary" /> : null}
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
                </RectangleIconButton>*/}

                {formVisible ? (
                  <>
                    <RectangleIconButton
                      color="success"
                      size="small"
                      onClick={handleSubmit(onSubmit)}
                      // loader={loader}
                    >
                      <Save color="success" />
                    </RectangleIconButton>
                    <RectangleIconButton
                      color="error"
                      onClick={() => {
                        setFormVisible(false);
                        if (fields.length > dataLength) {
                          remove(
                            Array(fields.length - dataLength)
                              .fill("*")
                              .map((i, index) => fields.length - (index + 1))
                          );
                        }
                      }}
                    >
                      <Clear color="error" />
                    </RectangleIconButton>
                  </>
                ) : (
                  fields.length > 0 && (
                    <RectangleIconButton
                      color="success"
                      size="small"
                      onClick={() => {
                        setFormVisible(true);
                        reset();
                      }}
                    >
                      <Edit color="primary" />
                    </RectangleIconButton>
                  )
                )}

                <DocumentGeneratorButton />

                {filteredRelations[selectedTabIndex].multiple_insert && (
                  <MultipleInsertButton
                    view={filteredRelations[selectedTabIndex]}
                    tableSlug={filteredRelations[selectedTabIndex].relatedTable}
                  />
                )}

                <RectangleIconButton
                  color="white"
                  onClick={() => setHeightControl(!heightControl)}
                >
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <FormatLineSpacingIcon color="primary" />
                    </span>
                    {heightControl && (
                      <div className={style.heightControl}>
                        {tableHeightOptions.map((el) => (
                          <div
                            key={el.value}
                            className={style.heightControl_item}
                            onClick={() => handleHeightControl(el.value)}
                          >
                            {el.label}
                            {tableHeight === el.value ? (
                              <CheckIcon color="primary" />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </RectangleIconButton>

                <RectangleIconButton
                  color="success"
                  size="small"
                  onClick={() => setMoreShowButton(!moreShowButton)}
                >
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <MoreVertIcon color="primary" />
                    </span>
                    {moreShowButton && (
                      <div
                        className={style.heightControl}
                        style={{ minWidth: "auto" }}
                      >
                        <div
                          className={style.heightControl_item}
                          style={{
                            justifyContent: "flex-start",
                            color: "#6E8BB7",
                            padding: "5px",
                          }}
                        >
                          <ExcelUploadButton withText={true} />
                        </div>

                        <div
                          className={style.heightControl_item}
                          style={{
                            justifyContent: "flex-start",
                            color: "#6E8BB7",
                            padding: "5px",
                          }}
                        >
                          <ExcelDownloadButton
                            relatedTable={selectedRelation?.relatedTable}
                            fieldSlug={fieldSlug}
                            fieldSlugId={id}
                            withText={true}
                            sort={myRef.current.excelSort()}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </RectangleIconButton>
              </div>
            </div>

            {filteredRelations?.map((relation) => (
              <TabPanel key={relation.id}>
                {relation?.relatedTable === "file" ? (
                  <FilesSection
                    shouldGet={shouldGet}
                    setFormValue={setFormValue}
                    remove={remove}
                    reset={reset}
                    watch={watch}
                    control={control}
                    formVisible={formVisible}
                    relation={relation}
                    key={relation.id}
                    createFormVisible={relationsCreateFormVisible}
                    setCreateFormVisible={setCreateFormVisible}
                  />
                ) : (
                  <RelationTable
                    ref={myRef}
                    setFieldSlug={setFieldSlug}
                    setDataLength={setDataLength}
                    shouldGet={shouldGet}
                    remove={remove}
                    reset={reset}
                    selectedTabIndex={selectedTabIndex}
                    watch={watch}
                    control={control}
                    setFormValue={setFormValue}
                    fields={fields}
                    setFormVisible={setFormVisible}
                    formVisible={formVisible}
                    key={relation.id}
                    relation={relation}
                    createFormVisible={relationsCreateFormVisible}
                    setCreateFormVisible={setCreateFormVisible}
                    selectedObjects={selectedObjects}
                    setSelectedObjects={setSelectedObjects}
                    tableSlug={tableSlug}
                    id={id}
                  />
                )}
              </TabPanel>
            ))}
          </Tabs>
        </Card>
      ) : null}
    </>
  );
};

export default RelationSection;
