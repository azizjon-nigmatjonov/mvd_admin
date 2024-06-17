import CustomTabs from "../../components/CustomTabs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormCard from "../../components/FormCard";
import styles from "./styles.module.scss";
import HFTextField from "../../components/FormElements/HFTextField";
import { useForm } from "react-hook-form";
import FRow from "../../components/FormElements/FRow";
import clientTypeServiceV2 from "../../services/auth/clientTypeServiceV2";
import constructorTableService from "../../services/constructorTableService";
import constructorFieldService from "../../services/constructorFieldService";
import Logins from "./Logins";
import Connections from "./Connections";
import MatrixRoles from "./MatrixRoles";
import HeaderSettings from "../../components/HeaderSettings";

const MatrixDetail = () => {
  const [tabIndex, setTabIndex] = useState(1);
  const tabs = [
    {
      id: 1,
      name: "Инфо",
    },
    {
      id: 2,
      name: "Роли",
    },
  ];
  const params = useParams();
  const [clientType, setClientType] = useState({});
  const [tables, setTables] = useState([]);
  const [fields, setFields] = useState([]);

  const getTables = () => {
    constructorTableService
      .getList()
      .then((res) => {
        setTables(res?.tables || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getFields = (params) => {
    constructorFieldService
      .getList(params)
      .then((res) => {
        setFields(res?.fields || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getClientType = () => {
    clientTypeServiceV2
      .getById(params.typeId)
      .then((res) => {
        setClientType(res?.data?.response);
        const platform = res?.data?.response?.$client_platform?.find(
          (item) => item?.guid === params.platformId
        );
        infoForm.setValue("name", platform?.name);
        infoForm.setValue("subdomain", platform?.subdomain);
        infoForm.setValue("userType", res?.data?.response?.name);
        infoForm.setValue("clientTypeId", res?.data?.response?.guid);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const computedTableOptions = tables.map((item) => ({
    ...item,
    value: item.id,
  }));

  const computedFieldOptions = fields.map((item) => ({
    ...item,
    value: item.slug,
  }));

  const infoForm = useForm({
    defaultValues: {
      name: "",
      subdomain: "",
      userType: "",
      clientTypeId: "",
    },
  });

  useEffect(() => {
    getClientType();
    getTables();
  }, []);

  return (
    <div>
      <HeaderSettings title="Matrix">
        <CustomTabs tabIndex={tabIndex} setTabIndex={setTabIndex} tabs={tabs} />
      </HeaderSettings>

      {tabIndex === 1 ? (
        <div className={styles?.detail_holder}>
          <FormCard title="Инфо" icon="address-card.svg" maxWidth="100%">
            <div className={styles.info_card}>
              <FRow label="Domain">
                <HFTextField
                  name="subdomain"
                  control={infoForm.control}
                  fullWidth
                />
              </FRow>
              <FRow label="Название">
                <HFTextField name="name" control={infoForm.control} fullWidth />
              </FRow>
              <FRow label="User type">
                <HFTextField
                  name="userType"
                  control={infoForm.control}
                  fullWidth
                />
              </FRow>
            </div>
          </FormCard>

          <Logins
            clientType={clientType}
            tables={computedTableOptions}
            fields={computedFieldOptions}
            getFields={getFields}
          />

          <Connections
            clientType={clientType}
            tables={computedTableOptions}
            fields={computedFieldOptions}
            getFields={getFields}
          />
        </div>
      ) : (
        <div style={{ margin: "8px" }}>
          <MatrixRoles infoForm={infoForm} />
        </div>
      )}
    </div>
  );
};

export default MatrixDetail;
