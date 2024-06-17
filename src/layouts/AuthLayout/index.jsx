import { Outlet } from "react-router-dom"
import styles from "./style.module.scss"
import config from "../../../builder_config/config.json"
import CompanyLogo from "../../../builder_config/assets/company-logo.png"

const AuthLayout = () => {
  return (
    <div className={styles.layout}>
      <div className={styles.leftSide}>
        <div></div>
        <div className={styles.logoBlock}>
          {/* <h1 className={styles.logoTitle}>{config?.company_name}</h1> */}
          <img className={styles.companyLogo} src={CompanyLogo} alt="logo" />
          <p className={styles.logoSubtitle} >{config?.company_subtitle}</p>
        </div>

        <div className={styles.subtitleBlock}>© {config?.company_name}. Все права защищены</div>

      </div>
      <div className={styles.rightSide}>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
