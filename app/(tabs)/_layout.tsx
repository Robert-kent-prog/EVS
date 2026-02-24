import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { invigilatorTheme } from "../theme/invigilatorTheme";

export default function TabLayout() {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: invigilatorTheme.colors.primary,
        tabBarInactiveTintColor: "#7f8c8d",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: invigilatorTheme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: invigilatorTheme.colors.border,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="qrcode" size={24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" size={24} color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
}
