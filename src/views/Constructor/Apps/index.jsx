import { Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import RectangleIconButton from "../../../components/Buttons/RectangleIconButton";
import {
  CTable,
  CTableBody,
  CTableCell,
  CTableHead,
  CTableRow,
} from "../../../components/CTable";
import DeleteWrapperModal from "../../../components/DeleteWrapperModal";
import FiltersBlock from "../../../components/FiltersBlock";
import HeaderSettings from "../../../components/HeaderSettings";
import PermissionWrapperV2 from "../../../components/PermissionWrapper/PermissionWrapperV2";
import SearchInput from "../../../components/SearchInput";
import TableCard from "../../../components/TableCard";
import TableRowButton from "../../../components/TableRowButton";
import { deleteApplicationAction } from "../../../store/application/application.thunk";

const AppsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.application.list);
  const loader = useSelector((state) => state.application.loader);

  const navigateToEditForm = (id) => {
    navigate(`${location.pathname}/${id}`);
  };

  const navigateToCreateForm = () => {
    navigate(`${location.pathname}/create`);
  };

  const deleteTable = (id) => {
    dispatch(deleteApplicationAction(id));
  };

  return (
    <div>
      <HeaderSettings title={"Приложение"} />

      <FiltersBlock>
        <div className="p-1">
          <SearchInput />
        </div>
      </FiltersBlock>

      <TableCard>
        <CTable disablePagination removableHeight={140}>
          <CTableHead>
            <CTableCell width={10}>№</CTableCell>
            <CTableCell>Название</CTableCell>
            <CTableCell>Описание</CTableCell>
            <PermissionWrapperV2 tabelSlug="app" type="delete">
              <CTableCell width={60} />
            </PermissionWrapperV2>
          </CTableHead>

          <CTableBody loader={loader} columnsCount={4} dataLength={list.length}>
            {list?.map((element, index) => (
              <CTableRow
                key={element.id}
                onClick={() => navigateToEditForm(element.id)}
              >
                <CTableCell>{index + 1}</CTableCell>
                <CTableCell>{element.name}</CTableCell>
                <CTableCell>{element.description}</CTableCell>
                <PermissionWrapperV2 tabelSlug="app" type="delete">
                  <CTableCell>
                    <DeleteWrapperModal id={element.id} onDelete={deleteTable}>
                      <RectangleIconButton color="error">
                        <Delete color="error" />
                      </RectangleIconButton>
                    </DeleteWrapperModal>
                  </CTableCell>
                </PermissionWrapperV2>
              </CTableRow>
            ))}
            <PermissionWrapperV2 tabelSlug="app" type="write">
              <TableRowButton colSpan={4} onClick={navigateToCreateForm} />
            </PermissionWrapperV2>
          </CTableBody>
        </CTable>
      </TableCard>
    </div>
  );
};

export default AppsPage;
