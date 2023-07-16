import { SettingBlock, SettingBlockItemRow } from "@/components";
import { SETTINGS_MENU_DESCRIPTION, SETTINGS_MENU_TITLE } from "@/constants";
import { Controller, useForm } from "react-hook-form";
import { OverlayFormValidationSchema } from "../validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Checkbox, Input, Slider, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Overlay } from "@/@types";

export const AddOverlaySettingBlock = () => {
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid },
    reset,
  } = useForm<Overlay>({
    mode: "all",
    resolver: zodResolver(OverlayFormValidationSchema),
    defaultValues: {
      title: "",
      url: "",
      customTheme: "",
      opacity: 100,
      fontSize: 24,
      isEnableFontSize: false,
    },
  });

  const handleSubmit = handleFormSubmit((value) => {
    window.addWebOverlay(value);
    notifications.show({
      title: "웹페이지 추가 완료!",
      message:
        '새 웹페이지가 추가되었어요. "시스템 트레이 메뉴" - "웹페이지 열기/닫기"에서 추가된 웹페이지 오버레이를 띄울 수 있습니다.',
    });
    reset();
  });

  return (
    <SettingBlock
      id="addOverlay"
      title={SETTINGS_MENU_TITLE.addOverlay}
      description={SETTINGS_MENU_DESCRIPTION.addOverlay}
      footer={
        <Button size="xs" onClick={handleSubmit} disabled={!isValid}>
          추가
        </Button>
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
      <SettingBlockItemRow
        title="커스텀 CSS"
        description="웹페이지를 구분할 수 있는 이름을 기입해주세요."
      >
        <Controller
          control={control}
          name="customTheme"
          render={({ field }) => <Textarea {...field} />}
        />
      </SettingBlockItemRow>
      <SettingBlockItemRow
        title="창 투명도"
        description="오버레이의 창 투명도를 조절할 수 있습니다."
      >
        <Controller
          control={control}
          name="opacity"
          render={({ field }) => (
            <Slider {...field} min={0} max={100} step={1} />
          )}
        />
      </SettingBlockItemRow>
      <SettingBlockItemRow
        title="폰트 크기"
        description="오버레이의 폰트 크기를 조절할 수 있습니다. 체크를 해제하면 웹페이지의 기본 폰트사이즈가 적용됩니다."
      >
        <div className="flex justify-start w-full gap-[10px]">
          <Controller
            control={control}
            name="isEnableFontSize"
            render={({ field: { value, ...field } }) => (
              <>
                <Checkbox {...field} checked={value} size="xs" />
                <Controller
                  control={control}
                  name="fontSize"
                  render={({ field }) => (
                    <Slider
                      {...field}
                      className="w-full"
                      disabled={!value}
                      min={0}
                      max={100}
                      step={1}
                    />
                  )}
                />
              </>
            )}
          />
        </div>
      </SettingBlockItemRow>
    </SettingBlock>
  );
};
