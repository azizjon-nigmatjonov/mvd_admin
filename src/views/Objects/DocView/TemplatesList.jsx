import { Add } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useParams } from "react-router-dom";
import { generateID } from "../../../utils/generateID";
import styles from "./style.module.scss";

const TemplatesList = ({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  templateFields,
}) => {
  const { tableSlug } = useParams();

  const onCreateButtonClick = () => {
    const data = {
      id: generateID(),
      title: "NEW",
      type: "CREATE",
      table_slug: tableSlug,
      html: "",
    };
    setSelectedTemplate(data);
  };
  console.log("templates", templates);

  return (
    <div className={styles.docListBlock}>
      <div className={styles.doclistHeader}>
        <div className={styles.doclistHeaderTitle}>Шаблоны</div>
        <IconButton onClick={onCreateButtonClick}>
          <Add />
        </IconButton>
      </div>

      <div className={styles.docList}>
        {templates?.map((template) => (
          <div
            key={template.id}
            className={`${styles.row} ${
              selectedTemplate?.guid === template.guid ? styles.active : ""
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            {template.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesList;
