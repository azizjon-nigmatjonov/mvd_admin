import { CircularProgress } from "@mui/material"
import styles from "./style.module.scss"

const ExportBlock = ({
  pdfLoader,
  exportToPDF,
  htmlLoader,
  exportToHTML,
}) => {
  return (
    <div className={styles.docListBlock}>
      <div className={styles.doclistHeader}>
        <div className={styles.doclistHeaderTitle}>Экспорт</div>
      </div>

      <div className={styles.docList}>
        <div className={styles.pageSizeRow} onClick={exportToPDF}>
          <div className={styles.documentIcon}>PDF</div> Export to PDF
          {pdfLoader && <CircularProgress size={14} />}
        </div>
        <div className={styles.pageSizeRow} onClick={exportToHTML} >
          <div className={styles.documentIcon}>Variable</div> Set variables
          {htmlLoader && <CircularProgress size={14} />}
        </div>
      </div>
    </div>
  )
}

export default ExportBlock
