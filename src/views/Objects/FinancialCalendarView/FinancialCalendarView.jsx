import { useState } from "react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

import constructorObjectService from "../../../services/constructorObjectService";
import styles from "./style.module.scss";
import { useEffect } from "react";
import { format } from "date-fns";
import RecursiveBlock from "./RecursiveBlock";
import { ru } from "date-fns/locale";

const FinancialCalendarView = ({
  view,
  fieldsMap,
  tab,
  filters,
  financeDate,
}) => {
  const { tableSlug } = useParams();
  const [dataList, setDataList] = useState();

  const parentElements = useMemo(() => {
    if (financeDate?.length) {
      return financeDate.filter((row) => !row[`${tableSlug}_id`]);
    }
  }, [financeDate, tableSlug]);

  const getDates = useMemo(() => {
    const val = [];
    if (financeDate?.length > 0) {
      financeDate?.[0]?.amounts.map((item) => {
        val.push(item?.month);
      });
    }
    return val;
  }, [financeDate]);

  const getAccountList = () => {
    constructorObjectService
      .getList(tableSlug, {
        data: { offset: 0, ...filters, [tab?.slug]: tab?.value },
      })
      .then((res) => {
        setDataList(res?.data?.response);
      });
  };

  useEffect(() => {
    getAccountList();
  }, []);

  return (
    <div className={styles.financial_view}>
      <div className={styles.datesRow}>
        <div className={styles.mockBlock} />

        {getDates?.map((item) => (
          <div className={styles.monthBlock}>
            <span className={styles.monthText}>
              {`${format(new Date(item), "LLL", { locale: ru })} '${format(
                new Date(item),
                "yy",
                { locale: ru }
              )}`}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.row_element}>
        {parentElements?.map((row) => (
          <RecursiveBlock
            key={row?.guid}
            row={row}
            view={view}
            dataList={dataList}
            fieldsMap={fieldsMap}
            financeDate={financeDate}
            getDates={getDates}
          />
        ))}
      </div>
    </div>
  );
};

export default FinancialCalendarView;
