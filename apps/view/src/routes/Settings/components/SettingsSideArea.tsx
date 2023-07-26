import { Divider, SideBarButton } from "@/components";
import {
  AddCircle,
  AddCircleOutline,
  Close,
  Edit,
  EditOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
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
      <SideBarButton
        icon={<FileUploadOutlined />}
        onClick={() => setSearchParams({ menu: "exportSettings" })}
      >
        설정 내보내기
      </SideBarButton>
      <SideBarButton
        icon={<FileDownloadOutlined />}
        onClick={() => setSearchParams({ menu: "importSettings" })}
      >
        설정 가져오기
      </SideBarButton>
      <Divider />
      <SideBarButton icon={<Close />} onClick={() => window.close()}>
        설정 닫기
      </SideBarButton>
    </>
  );
};
