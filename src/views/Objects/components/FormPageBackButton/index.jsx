import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../../components/BackButton";
import useTabRouter from "../../../../hooks/useTabRouter";

const FormPageBackButton = () => {
  const { deleteTab } = useTabRouter()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const clickHandler = () => {
    deleteTab(pathname)
    navigate(-1)
  }

  return ( <BackButton className="ml-1" onClick={clickHandler} /> );
}
 
export default FormPageBackButton;