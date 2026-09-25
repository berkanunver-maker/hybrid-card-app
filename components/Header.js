import React from "react";
import { View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../utils/theme";
import AppText from "./ui/Text";
import Icon from "./ui/Icon";
import { useTranslation } from "../i18n/I18nProvider";

export default function Header({
  title = "",
  onBackPress,
  rightIcon,
  onRightPress,
  style,
  textStyle,
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const canGoBack = navigation?.canGoBack?.() ?? false;

  const handleBack = () => {
    if (onBackPress) onBackPress();
    else if (canGoBack) navigation.goBack();
  };

  return (
    <View
      style={[
        {
          paddingTop: insets.top,
          backgroundColor: colors.bg,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View
        style={{
          height: 52,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 8,
        }}
      >
        {canGoBack || onBackPress ? (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.back")}
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <Icon name="chevron-back" size={26} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 44, height: 44 }} />
        )}

        <AppText
          variant="heading"
          numberOfLines={1}
          style={[{ flex: 1, textAlign: "center" }, textStyle]}
        >
          {title}
        </AppText>

        {rightIcon ? (
          <Pressable
            onPress={onRightPress}
            accessibilityRole="button"
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <Icon name={rightIcon} size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 44, height: 44 }} />
        )}
      </View>
    </View>
  );
}
