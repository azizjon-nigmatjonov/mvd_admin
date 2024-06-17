import { Download } from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useParams } from "react-router-dom";
import RectangleIconButton from "../../../components/Buttons/RectangleIconButton";

import ObjectDataTable from "../../../components/DataTable/ObjectDataTable";
import FRow from "../../../components/FormElements/FRow";
import TableRowButton from "../../../components/TableRowButton";
import useDownloader from "../../../hooks/useDownloader";
import useObjectsQuery from "../../../queries/hooks/useObjectsQuery";
import constructorObjectService from "../../../services/constructorObjectService";
import objectDocumentService from "../../../services/objectDocumentService";
import { generateID } from "../../../utils/generateID";
import { listToMap } from "../../../utils/listToMap";
import { pageToOffset } from "../../../utils/pageToOffset";
import { Filter } from "../components/FilterGenerator";
import styles from "./style.module.scss";

const FilesSection = ({
  setFormValue,
  shouldGet,
  remove,
  reset,
  watch,
  formVisible,
  control,
  relation,
  createFormVisible,
  setCreateFormVisible,
}) => {
  const inputRef = useRef();
  const { tableSlug, id: objectId } = useParams();
  const { download } = useDownloader();
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});

  const filterChangeHandler = (value, name) => {
    setFilters({
      ...filters,
      [name]: value ?? undefined,
    });
  };

  const {
    query: {
      data: {
        tableData = [],
        pageCount = 1,
        columns = [],
        quickFilters = [],
      } = {},
      isLoading,
      refetch,
    },
  } = useObjectsQuery({
    tableSlug: "file",
    queryPayload: {
      shouldGet,
      limit,
      offset: pageToOffset(currentPage, limit),
      [`${tableSlug}_id`]: objectId,
      ...filters,
    },
    queryParams: {
      select: ({ data }) => {
        const tableData = objectId ? data.response : [];
        const pageCount = isNaN(data.count) ? 1 : Math.ceil(data.count / limit);

        const fieldsMap = listToMap(data.fields);

        const columns = relation.columns
          ?.map((id) => fieldsMap[id])
          ?.filter((el) => el);
        const quickFilters = relation.quick_filters
          ?.map(({ field_id }) => fieldsMap[field_id])
          ?.filter((el) => el);
        return {
          tableData,
          pageCount,
          columns,
          quickFilters,
        };
      },
    },
  });

  const { mutate: create, isLoading: createLoader } = useMutation(
    (e) => {
      const file = e.target.files[0];

      const data = new FormData();
      data.append("file", file);

      return objectDocumentService.upload(tableSlug, objectId, data);
    },
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const { mutateAsync: updateMutation } = useMutation(
    (values) => {
      return constructorObjectService.update("file", { data: values });
    },
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const { mutate: deleteMutation, isLoading: deleteLoading } = useMutation(
    (row) => {
      return constructorObjectService.delete("file", row.guid);
    },
    {
      onSuccess: () => refetch(),
    }
  );

  const onFormSubmit = (values) => {
    return updateMutation(values);
  };

  const computedColumns = useMemo(() => {
    if (!columns?.length) return [];

    return [
      ...columns,
      {
        id: generateID(),
        render: (row) => (
          <RectangleIconButton
            color="primary"
            onClick={() =>
              download({ link: row.file_link, fileName: row.name })
            }
          >
            <Download color="primary" />
          </RectangleIconButton>
        ),
      },
    ];
  }, [columns]);

  // const columns = [
  //   {
  //     id: "1",
  //     slug: "type",
  //     label: "Type",
  //     render: (val) => <span className="flex align-center justify-center"><FileIconGenerator type={val} /></span>,
  //     width: 10,
  //   },
  //   {
  //     id: "2",
  //     slug: "name",
  //     label: "Name",
  //   },
  //   {
  //     id: "3",
  //     slug: "size",
  //     label: "Size",
  //     width: 120,
  //     render: (val) => bytesToSize(val),
  //   },
  //   {
  //     id: "4",
  //     slug: "tags",
  //     label: "Tags",
  //     width: 120,
  //     render: (tags, row) => <FileTagSelect tags={tags} row={row} />
  //   },
  //   {
  //     id: "5",
  //     slug: "",
  //     width: 10,
  //     render: (row) => (
  //       <span className="flex align-center gap-1">
  //         <RectangleIconButton
  //           loader={downloadLoader && downLoadedFile === row.id}
  //           onClick={() => {
  //             setDownLoadedFile(row.id)
  //             download({ link: row.file_link, fileName: row.name })
  //           }}
  //         >
  //           <Download color="primary" />
  //         </RectangleIconButton>
  //         <RectangleIconButton
  //           color="error"
  //           onClick={() => deleteMutation(row)}
  //         >
  //           <Delete color="error" />
  //         </RectangleIconButton>
  //       </span>
  //     ),
  //   },
  // ]

  useEffect(() => {
    if (tableData?.length) {
      reset({
        multi: tableData.map((i) => i),
      });
    }
  }, [tableData, reset]);

  return (
    <div className={styles.relationTable}>
      {!!quickFilters?.length && (
        <div className={styles.filtersBlock}>
          {quickFilters.map((field) => (
            <FRow key={field.id} label={field.label}>
              <Filter
                field={field}
                name={field.slug}
                tableSlug={"file"}
                filters={filters}
                onChange={filterChangeHandler}
              />
            </FRow>
          ))}
          1234
        </div>
      )}

      <div className={styles.tableBlock}>
        <ObjectDataTable
          setFormValue={setFormValue}
          remove={remove}
          reset={reset}
          watch={watch}
          control={control}
          formVisible={formVisible}
          data={tableData}
          columns={computedColumns}
          pagesCount={pageCount}
          loader={isLoading || deleteLoading}
          removableHeight={290}
          currentPage={1}
          disableFilters
          dataLength={1}
          limit={limit}
          setLimit={setLimit}
          onPaginationChange={setCurrentPage}
          onDeleteClick={deleteMutation}
          onFormSubmit={relation.is_editable && onFormSubmit}
          createFormVisible={createFormVisible[relation.id]}
          setCreateFormVisible={(val) => setCreateFormVisible(relation.id, val)}
          additionalRow={
            <>
              <TableRowButton
                onClick={() => inputRef.current.click()}
                colSpan={columns.length + 3}
                loader={createLoader}
              />
            </>
          }
          // onPaginationChange={setCurrentPage}
        />
        <input
          className="hidden-element"
          type={"file"}
          ref={inputRef}
          onChange={create}
        />
      </div>
    </div>
  );
};

export default FilesSection;
