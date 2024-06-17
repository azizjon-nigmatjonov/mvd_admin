import ExportBlock from "./ExportBlock"
import PageSizeBlock from "./PageSizeBlock"
import styles from "./style.module.scss"

const DocSettingsBlock = ({
  selectedSettingsTab,
  exportToPDF,
  pdfLoader,
  selectedPaperSizeIndex,
  setSelectedPaperSizeIndex,
  htmlLoader,
  exportToHTML,
}) => {
  return (
    <div className={styles.docSettingsBlock}>
      {selectedSettingsTab === 0 && (
        <PageSizeBlock
          selectedPaperSizeIndex={selectedPaperSizeIndex}
          setSelectedPaperSizeIndex={setSelectedPaperSizeIndex}
        />
      )}
      {selectedSettingsTab === 1 && (
        <ExportBlock
          exportToPDF={exportToPDF}
          pdfLoader={pdfLoader}
          htmlLoader={htmlLoader}
          exportToHTML={exportToHTML}
        />
      )}
    </div>
  )
}

export default DocSettingsBlock
