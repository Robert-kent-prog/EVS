import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStudentAuth } from "../_context/StudentAuthContext";
import { studentTheme } from "../_theme/studentTheme";

export default function StudentTabLayout() {
  const { isAuthenticated, isLoading } = useStudentAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: studentTheme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: studentTheme.colors.border,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarActiveTintColor: studentTheme.colors.primary,
        tabBarInactiveTintColor: studentTheme.colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exam-cards"
        options={{
          title: "Exam Cards",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="card-membership" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lecturer-evaluations"
        options={{
          title: "Evaluations",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="rate-review" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-note" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lecturer-evaluation"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
