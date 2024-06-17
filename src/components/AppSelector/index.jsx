import { Menu } from "@mui/material"
import { useState } from "react"
import { useSelector } from "react-redux"
import RectangleIconButton from "../Buttons/RectangleIconButton"
import IconGenerator from "../IconPicker/IconGenerator"
import styles from "./style.module.scss"
import DashboardIcon from "@mui/icons-material/Dashboard"
import { staticApps } from "./staticApps"
import { useLocation, useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { useDispatch } from "react-redux"
import { tabRouterActions } from "../../store/tabRouter/tabRouter.slice"
import { useAliveController } from "react-activation"

const AppSelector = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const menuVisible = Boolean(anchorEl)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { clear } = useAliveController()

  const applications = useSelector((state) => state.application.list)

  const computedList = useMemo(() => {
    return [...applications, ...staticApps]
  }, [applications])

  const activeApp = useMemo(() => {
    if (pathname.includes("/main")) {
      return pathname.split("/")[2]
    }

    return pathname.split("/")[1]
  }, [pathname])

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  const rowClickHandler = (table) => {
    if (table.type === "static") navigate(`/${table.id}`)
    else navigate(`/main/${table.id}`)

    dispatch(tabRouterActions.clear())
    clear()
    closeMenu()
  }

  return (
    <div>
      <RectangleIconButton
        onClick={openMenu}
        color="primary"
        className={`${styles.addButton}`}
      >
        <DashboardIcon />
      </RectangleIconButton>

      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        open={menuVisible}
        onClose={closeMenu}
        classes={{ list: styles.menu, paper: styles.paper }}
      >
        <div className={styles.scrollBlocksss}>
          {computedList.map((app, index) => (
            <div
              key={app.id}
              className={`${styles.menuItem} ${
                app.id === activeApp ? styles.active : ""
              }`}
              onClick={() => rowClickHandler(app)}
            >
              <IconGenerator
                icon={app.icon}
                className={`${styles.dragIcon} drag-handle`}
              />
              <p className={styles.itemText}>{app.name}</p>
            </div>
          ))}
        </div>
      </Menu>
    </div>
  )
}

export default AppSelector
