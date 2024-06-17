import { Save } from "@mui/icons-material";
import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import PrimaryButton from "../../../components/Buttons/PrimaryButton";
import SecondaryButton from "../../../components/Buttons/SecondaryButton";
import Footer from "../../../components/Footer";
import FormCard from "../../../components/FormCard";
import FRow from "../../../components/FormElements/FRow";
import HFIconPicker from "../../../components/FormElements/HFIconPicker";
import HFTextField from "../../../components/FormElements/HFTextField";
import HeaderSettings from "../../../components/HeaderSettings";
import PageFallback from "../../../components/PageFallback";
import PermissionWrapperV2 from "../../../components/PermissionWrapper/PermissionWrapperV2";
import applicationService from "../../../services/applicationSercixe";
import { fetchApplicationListActions } from "../../../store/application/application.thunk";
import TablesList from "../Tables/TablesList";

const applicationListPageLink = "/settings/constructor/apps";

const AppsForm = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [search, setSearch] = useSearchParams();
  const [btnLoader, setBtnLoader] = useState();
  const [loader, setLoader] = useState(true);
  const [appData, setAppData] = useState({});

  const mainForm = useForm({
    defaultValues: {
      description: "",
      icon: "",
      name: "",
      table_ids: [],
    },
  });

  const createApp = (data) => {
    setBtnLoader(true);

    applicationService
      .create(data)
      .then(() => {
        console.log("sdasdasdadadas");
        navigate(applicationListPageLink);
        dispatch(fetchApplicationListActions());
      })
      .catch(() => setBtnLoader(false));
  };

  const updateApp = (data) => {
    setBtnLoader(true);

    applicationService
      .update({
        ...data,
      })
      .then(() => {
        navigate(applicationListPageLink);
        dispatch(fetchApplicationListActions());
      })
      .catch(() => setBtnLoader(false));
  };

  const getData = () => {
    setLoader(true);

    applicationService
      .getById(appId)
      .then((res) => {
        const computedData = {
          ...mainForm.getValues(),
          ...res,
          table_ids: res.tables?.map((table) => table.id) ?? [],
        };
        mainForm.reset(computedData);
        setAppData(computedData);
      })
      .finally(() => setLoader(false));
  };

  useEffect(() => {
    if (appId) getData();
    else setLoader(false);
  }, []);

  const onSubmit = (data) => {
    const tables = data?.tables?.map((table) => ({
      table_id: table.id,
      is_own_table: Boolean(table.is_own_table),
      is_visible: Boolean(table.is_visible),
    }));

    const computedData = {
      ...data,
      tables,
    };

    if (appId) updateApp(computedData);
    else createApp(computedData);
  };

  if (loader) return <PageFallback />;

  return (
    <div>
      <Tabs
        selectedIndex={Number(search.get("tab") ?? 0)}
        onSelect={(index) => setSearch({ tab: index })}
        direction={"ltr"}
        style={{ height: "100vh", position: "relative" }}
      >
        <HeaderSettings
          title="Приложение"
          backButtonLink={applicationListPageLink}
          subtitle={appId ? mainForm.watch("name") : "Новый"}
        >
          <TabList>
            <Tab>Details</Tab>
            {appId && <Tab>Objects</Tab>}
          </TabList>
        </HeaderSettings>

        <TabPanel>
          <form
            onSubmit={mainForm.handleSubmit(onSubmit)}
            className="p-2"
            style={{ height: "calc(100vh - 112px)", overflow: "auto" }}
          >
            <FormCard title="Детали" maxWidth={500}>
              <FRow
                label={"Названия"}
                componentClassName="flex gap-2 align-center"
                required
              >
                <HFIconPicker
                  name="icon"
                  control={mainForm.control}
                  shape="rectangle"
                />
                <HFTextField
                  disabledHelperText
                  name="name"
                  control={mainForm.control}
                  fullWidth
                  required
                />
              </FRow>

              <FRow label="Описания">
                <HFTextField
                  name="description"
                  control={mainForm.control}
                  multiline
                  rows={4}
                  fullWidth
                />
              </FRow>
            </FormCard>
          </form>

          <Footer
            extra={
              <>
                <SecondaryButton
                  onClick={() => navigate(applicationListPageLink)}
                  color="error"
                >
                  Закрыть
                </SecondaryButton>
                <PermissionWrapperV2 tabelSlug="app" type="update">
                  <PrimaryButton
                    loader={btnLoader}
                    onClick={mainForm.handleSubmit(onSubmit)}
                  >
                    <Save /> Сохранить
                  </PrimaryButton>
                </PermissionWrapperV2>
              </>
            }
          />
        </TabPanel>

        {appId && (
          <TabPanel>
            <TablesList
              mainForm={mainForm}
              appData={appData}
              getData={getData}
            />
          </TabPanel>
        )}
      </Tabs>
    </div>
  );
};

export default AppsForm;
