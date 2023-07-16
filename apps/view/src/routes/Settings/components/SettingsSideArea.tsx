import { Divider, SideBarButton } from "@/components";
import {
  AddCircle,
  AddCircleOutline,
  Close,
  Edit,
  EditOutlined,
  FormatListNumbered,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";

export const SettingsSideArea = () => {
  const [, setSearchParams] = useSearchParams();

  return (
    <>
      <SideBarButton
        icon={<FormatListNumbered />}
        onClick={() => setSearchParams({ menu: "overlayList" })}
      >
        웹 오버레이 목록
      </SideBarButton>
      <SideBarButton
        icon={<AddCircleOutline />}
        hoveredIcon={<AddCircle />}
        onClick={() => setSearchParams({ menu: "addOverlay" })}
      >
        새 웹 오버레이 추가
      </SideBarButton>
      <SideBarButton
        icon={<EditOutlined />}
        hoveredIcon={<Edit />}
        onClick={() => setSearchParams({ menu: "editOverlay" })}
      >
        웹 오버레이 수정
      </SideBarButton>
      <Divider />
      <SideBarButton icon={<Close />} onClick={() => window.close()}>
        설정 닫기
      </SideBarButton>
    </>
  );
};
