import { AccountCircle, Lock, SupervisedUserCircle } from "@mui/icons-material"
import { InputAdornment } from "@mui/material"
import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "react-query"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Tab, TabList, TabPanel, Tabs } from "react-tabs"
import PrimaryButton from "../../../components/Buttons/PrimaryButton"
import HFSelect from "../../../components/FormElements/HFSelect"
import HFTextField from "../../../components/FormElements/HFTextField"
import authService from "../../../services/auth/authService"
import clientTypeServiceV2 from "../../../services/auth/clientTypeServiceV2"
import { authActions } from "../../../store/auth/auth.slice"
import { loginAction } from "../../../store/auth/auth.thunk"
import listToOptions from "../../../utils/listToOptions"
import classes from "../style.module.scss"
import DynamicFields from "./DynamicFields"

const LoginForm = ({ navigateToRegistrationForm }) => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState(0)
  const [connections, setConnections] = useState([])
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [loginStrategies, setLoginStrategies] = useState({})
  const [resData, setResData] = useState({})
  
  const { control, handleSubmit, setValue, getValues, watch } = useForm({
    defaultValues: {
      client_type: "",
      recipient: "",
      sms_id: "",
      otp: "",
      email: "",
      username: "",
      password: "",
      tables: [],
    },
  })

  const otpCode = watch("otp")
  const phone = watch("recipient")
  const email = watch("email")

  const { data: { data } = {} } = useQuery(["GET_CLIENT_TYPES"], () => {
    return clientTypeServiceV2.getList()
  })

  const computedClientTypes = useMemo(() => {
    return listToOptions(data?.response, "name", "guid")
  }, [data?.response])

  const clientTypeId = watch("client_type")

  const getConnections = () => {
    axios
      .post(
        `${import.meta.env.VITE_CLIENT_BASE_URL}object/get-list/connections`,
        { data: { client_type_id: clientTypeId } }
      )
      .then((res) => {
        setConnections(res?.data?.data?.data?.response || [])
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getLoginStrategies = () => {
    axios
      .post(
        `${import.meta.env.VITE_CLIENT_BASE_URL}object/get-list/test_login`,
        {
          data: { client_type_id: clientTypeId },
        }
      )
      .then((res) => {
        setLoginStrategies(
          res?.data?.data?.data?.response?.reduce(
            (acc, curr) => ({
              ...acc,
              [curr["login_strategy"]]: curr.login_strategy?.length > 0,
            }),
            {}
          )
        )
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const selectedClientType = useMemo(() => {
    return data?.response?.find(
      (clientType) => clientType.guid === clientTypeId
    )
  }, [clientTypeId, data?.response])

  const verifySmsCode = (e) => {
    e.preventDefault()
    if (phone?.length > 0) {
      authService
        .verifyCode(resData?.sms_id, otpCode, {
          data: {
            ...resData.data,
          },
          tables: getValues("tables"),
        })
        .then((res) => {
          dispatch(authActions.loginSuccess(res))
        })
    } else {
      authService
        .verifyEmail(resData?.sms_id, otpCode, {
          data: {
            ...resData.data,
          },
          tables: getValues("tables"),
        })
        .then((res) => {
          dispatch(authActions.loginSuccess(res))
        })
    }
  }

  const onSubmit = (data) => {
    const computedData = {
      ...data,
      client_type: computedClientTypes?.find(
        (item) => item?.value === data?.client_type
      )?.label,
      tables: data?.tables?.filter((table) => table?.object_id?.length > 0),
    }

    // return console.log('computedData', computedData)

    const cashboxData = getCashboxData(data)

    setLoading(true)
    if (phone?.length > 0) {
      authService
        .sendCode({
          client_type: computedClientTypes?.find(
            (item) => item?.value === data?.client_type
          )?.label,
          recipient: computedData.recipient,
          text: "Code...",
        })
        .then((res) => {
          console.log("res", res)
          setResData(res)
          setIsCodeSent(true)
          setLoading(false)
        })
        .catch((err) => {
          console.log("err", err)
          setLoading(false)
        })
    } else if (email?.length > 0) {
      authService
        .sendMessage({
          client_type: computedClientTypes?.find(
            (item) => item?.value === data?.client_type
          )?.label,
          email,
        })
        .then((res) => {
          console.log("res", res)
          setResData(res)
          setIsCodeSent(true)
          setLoading(false)
        })
        .catch((err) => {
          console.log("err", err)
          setLoading(false)
        })
    } else {
      dispatch(loginAction({ data: computedData, cashboxData }))
        .unwrap()
        .then(() => {
          if (selectedClientType?.name === "CASHIER") {
            navigate("/cashbox/opening")
          }
        })
        .catch(() => setLoading(false))
    }
  }

  const getCashboxData = (data) => {
    if (selectedClientType?.name !== "CASHIER") return null
    const cashboxId = data.tables.cashbox
    const cashboxTable = selectedClientType?.tables?.find(
      (table) => table.slug === "cashbox"
    )
    const selectedCashbox = cashboxTable?.data?.response?.find(
      (object) => object.guid === cashboxId
    )
    return selectedCashbox
  }

  useEffect(() => {
    if (Object.keys(loginStrategies)) {
      setSelectedTab(0)
    }
  }, [loginStrategies])

  useEffect(() => {
    if (!clientTypeId) return
    getConnections()
    getLoginStrategies()
  }, [clientTypeId])

  useEffect(() => {
    setValue("recipient", "")
    setValue("username", "")
    setValue("password", "")
    setValue("email", "")
    setIsCodeSent(false)
  }, [selectedTab, clientTypeId])

  return (
    <form
      onSubmit={isCodeSent ? verifySmsCode : handleSubmit(onSubmit)}
      className={classes.form}
    >
      <Tabs
        direction={"ltr"}
        selectedIndex={selectedTab}
        onSelect={setSelectedTab}
      >
        <div style={{ padding: "20px" }}>
          <div style={{ padding: "10px" }}>
            {/* {!isCodeSent && ( */}
            <div className={classes.formRow}>
              <p className={classes.label}>Тип пользователя</p>
              <HFSelect
                control={control}
                name="client_type"
                size="large"
                fullWidth
                options={computedClientTypes}
                placeholder="Выберите тип пользователя"
                startAdornment={
                  <InputAdornment position="start">
                    <SupervisedUserCircle style={{ fontSize: "30px" }} />
                  </InputAdornment>
                }
              />
            </div>
            {/* )} */}

            <TabList>
              {(Object.keys(loginStrategies)?.length === 0 ||
                loginStrategies["Login with password"]) && <Tab>Логин</Tab>}
              {loginStrategies["Phone OTP"] && <Tab>Телефон</Tab>}
              {loginStrategies["Email OTP"] && <Tab>E-mail</Tab>}
            </TabList>

            <div
              onSubmit={handleSubmit}
              className={classes.formArea}
              style={{ marginTop: "10px" }}
            >
              {(Object.keys(loginStrategies)?.length === 0 ||
                loginStrategies["Login with password"]) && (
                <TabPanel>
                  <div className={classes.formRow}>
                    <p className={classes.label}>Логин</p>
                    <HFTextField
                      required
                      control={control}
                      name="username"
                      size="large"
                      fullWidth
                      placeholder="Введите логин"
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle style={{ fontSize: "30px" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                  <div className={classes.formRow}>
                    <p className={classes.label}>Пароль</p>
                    <HFTextField
                      required
                      control={control}
                      name="password"
                      type="password"
                      size="large"
                      fullWidth
                      placeholder="Введите пароль"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock style={{ fontSize: "30px" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                </TabPanel>
              )}

              {loginStrategies["Phone OTP"] && (
                <TabPanel>
                  <div className={classes.formRow}>
                    <p className={classes.label}>Телефон</p>
                    <HFTextField
                      required
                      control={control}
                      name="recipient"
                      size="large"
                      fullWidth
                      placeholder="Введите телефон"
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle style={{ fontSize: "30px" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                  {isCodeSent && (
                    <div className={classes.formRow}>
                      <p className={classes.label}>Смс код *</p>
                      <HFTextField
                        required
                        control={control}
                        name="otp"
                        size="large"
                        fullWidth
                        placeholder="Введите смс код"
                        autoFocus
                      />
                    </div>
                  )}
                </TabPanel>
              )}

              {loginStrategies["Email OTP"] && (
                <TabPanel>
                  <div className={classes.formRow}>
                    <p className={classes.label}>Эл. адрес</p>
                    <HFTextField
                      required
                      control={control}
                      name="email"
                      size="large"
                      fullWidth
                      placeholder="Введите Эл. адрес"
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle style={{ fontSize: "30px" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                  {isCodeSent && (
                    <div className={classes.formRow}>
                      <p className={classes.label}>Смс код *</p>
                      <HFTextField
                        required
                        control={control}
                        name="otp"
                        size="large"
                        fullWidth
                        placeholder="Введите смс код"
                        autoFocus
                      />
                    </div>
                  )}
                </TabPanel>
              )}
              {/* {connections?.length ? (
                <DynamicFields
                  table={connections}
                  control={control}
                  setValue={setValue}
                />
              ) : null} */}
              {connections.length
                ? connections.map((connection, idx) => (
                    <DynamicFields
                      key={connection?.guid}
                      table={connections}
                      connection={connection}
                      index={idx}
                      control={control}
                      setValue={setValue}
                    />
                  ))
                : null}
            </div>
          </div>
        </div>
      </Tabs>

      <div className={classes.buttonsArea}>
        <PrimaryButton size="large" loader={loading}>
          Войти
        </PrimaryButton>
      </div>
    </form>
  )
}

export default LoginForm
