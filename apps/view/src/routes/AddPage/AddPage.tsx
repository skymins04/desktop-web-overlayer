import {
  BaseLayout,
  Divider,
  SettingBlock,
  SettingBlockItemRow,
  SideBarButton,
} from "@/components";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Textarea } from "@mantine/core";
import { Close, NoteAdd, NoteAddOutlined } from "@mui/icons-material";
import {
  AddPageFormData,
  AddPageFormValidationSchema,
} from "./validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";

export const AddPage = () => {
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid },
    reset,
  } = useForm<AddPageFormData>({
    mode: "all",
    resolver: zodResolver(AddPageFormValidationSchema),
    defaultValues: {
      title: "",
      url: "",
      customTheme: "",
    },
  });

  const handleSubmit = handleFormSubmit((value) => {
    window.addWebPage(value);
    notifications.show({
      title: "웹페이지 추가 완료!",
      message:
        '새 웹페이지가 추가되었어요. "시스템 트레이 메뉴" - "웹페이지 열기/닫기"에서 추가된 웹페이지 오버레이를 띄울 수 있습니다.',
    });
    reset();
  });

  return (
    <BaseLayout
      sideArea={
        <>
          <SideBarButton icon={<NoteAddOutlined />} hoveredIcon={<NoteAdd />}>
            새 웹페이지 추가
          </SideBarButton>
          <Divider />
          <SideBarButton icon={<Close />} onClick={() => window.close()}>
            창닫기
          </SideBarButton>
        </>
      }
    >
      <SettingBlock
        title="새 웹페이지 추가"
        description="데스크탑 화면 오버레이로 띄울 웹페이지의 URL를 추가할 수 있습니다."
        footer={
          <>
            <Button size="sm" onClick={handleSubmit} disabled={!isValid}>
              추가하기
            </Button>
          </>
        }
      >
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState: { error } }) => (
            <SettingBlockItemRow
              title="웹페이지 별칭"
              description={
                error
                  ? "1자 이상의 이름을 기입하세요."
                  : "웹페이지를 구분할 수 있는 이름을 기입해주세요."
              }
              isError={!!error}
              required
            >
              <Input
                {...field}
                placeholder="유튜브 오버레이"
                styles={(theme) => ({
                  input: {
                    "&": {
                      borderColor: error && theme.colors.red[7],
                    },
                    "&:focus": {
                      borderColor: error && theme.colors.red[7],
                    },
                  },
                })}
              />
            </SettingBlockItemRow>
          )}
        />
        <Controller
          control={control}
          name="url"
          render={({ field, fieldState: { error } }) => (
            <SettingBlockItemRow
              title="웹페이지 URL"
              description={
                error
                  ? "유효한 형식의 URL을 기입하세요 (http:// 또는 https://로 시작해야합니다.)"
                  : "오버레이로 띄울 웹페이지의 URL을 기입해주세요."
              }
              required
              isError={!!error}
            >
              <Input
                {...field}
                placeholder="https://www.youtube.com/embed/abcdefg"
                styles={(theme) => ({
                  input: {
                    "&": {
                      borderColor: error && theme.colors.red[7],
                    },
                    "&:focus": {
                      borderColor: error && theme.colors.red[7],
                    },
                  },
                })}
              />
            </SettingBlockItemRow>
          )}
        />
        <Controller
          control={control}
          name="customTheme"
          render={({ field }) => (
            <SettingBlockItemRow
              title="커스텀 CSS"
              description="웹페이지를 구분할 수 있는 이름을 기입해주세요."
            >
              <Textarea {...field} />
            </SettingBlockItemRow>
          )}
        />
      </SettingBlock>
    </BaseLayout>
  );
};
