import {
  Modal as RNModal,
  ModalProps,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Pressable,
} from "react-native";
import { useState } from "react";

type PROPS = ModalProps & {
  isOpen: boolean;
  withInput?: boolean;
};

export const Modal = ({ isOpen, withInput, children, ...rest }: PROPS) => {
  const content = withInput ? (
    <KeyboardAvoidingView
      className="items-center justify-center flex-1 px-3 bg-zinc-900/40"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View className="items-center justify-center flex-1 px-3 bg-zinc-900/40">
      {children}
    </View>
  );

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      {...rest}
    >
      {content}
    </RNModal>
  );
};
