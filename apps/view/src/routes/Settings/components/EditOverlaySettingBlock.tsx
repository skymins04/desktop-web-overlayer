import { SettingBlock, SettingBlockItemRow } from "@/components";
import { SETTINGS_MENU_DESCRIPTION, SETTINGS_MENU_TITLE } from "@/constants";
import { Controller, useForm } from "react-hook-form";
import { OverlayFormValidationSchema } from "../validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Input,
  Select,
  Slider,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Overlay, Overlays } from "@/@types";

export const EditOverlaySettingBlock = () => {
  const [overlays, setOverlays] = useState<Overlays>({});
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid, isDirty },
    reset,
  } = useForm<Overlay>({
    mode: "all",
    resolver: zodResolver(OverlayFormValidationSchema),
  });

  const handleSubmit = handleFormSubmit((value) => {
    if (selectedOverlayId) {
      window.editOverlay(selectedOverlayId, value);
      notifications.show({
        title: "웹페이지 수정 완료!",
        message: "새 웹페이지가 수정되었어요.",
      });
    }
  });

  useEffect(() => {
    const handleGetOverlayList = (overlays: Overlays) => {
      setOverlays(overlays);
      if (selectedOverlayId && overlays[selectedOverlayId]) {
        reset(overlays[selectedOverlayId]);
      } else if (selectedOverlayId && !overlays[selectedOverlayId]) {
        setSelectedOverlayId(null);
        reset({ title: "", url: "", customTheme: "", opacity: 100 });
      }
    };

    window.addGetOverlayListListener(handleGetOverlayList);
    window.getOverlayList();

    return () => {
      window.removeGetOverlayListListener(handleGetOverlayList);
    };
  }, [selectedOverlayId]);

  return (
    <SettingBlock
      id="editOverlay"
      title={SETTINGS_MENU_TITLE.editOverlay}
      description={SETTINGS_MENU_DESCRIPTION.editOverlay}
      footer={
        <Button
          size="xs"
          onClick={handleSubmit}
          disabled={!isValid || !isDirty || selectedOverlayId === null}
        >
          저장
        </Button>
      }
    >
      <SettingBlockItemRow title="오버레이">
        <Select
          placeholder="오버레이 선택"
          data={Object.entries(overlays).map(([overlayId, overlay]) => ({
            value: overlayId,
            label: `${overlay.title} (${overlay.url})`,
          }))}
          value={selectedOverlayId}
          onChange={(e) => {
            setSelectedOverlayId(e);
            if (e) {
              const overlay = overlays[e];
              reset(overlay);
            } else {
              reset({ title: "", url: "", customTheme: "", opacity: 100 });
            }
          }}
        />
      </SettingBlockItemRow>
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
              disabled={selectedOverlayId === null}
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
              disabled={selectedOverlayId === null}
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
          render={({ field }) => (
            <Textarea {...field} disabled={selectedOverlayId === null} />
          )}
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
            <Slider
              {...field}
              disabled={selectedOverlayId === null}
              min={0}
              max={100}
              step={1}
            />
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
